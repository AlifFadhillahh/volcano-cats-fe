"use client";
import { useMemo } from "react";
import { Card, CardType, isGangCard, NEEDS_TARGET, GANG_TYPES } from "@/types/game";
import { GameCard } from "@/components/game/GameCard";
import { useGameStore } from "@/store/gameStore";
import clsx from "clsx";

interface PlayerHandProps {
  hand: Card[];
  isMyTurn: boolean;
  onPlayCard: (cardId: string, needsTarget: boolean) => void;
  onPlayGang: (cardIds: string[], needsTarget: boolean) => void;
  hasPendingAction: boolean;
}

// Urutan tampil grup kartu di tangan — gang cards dulu (paling sering dikombinasikan),
// lalu kartu aksi umum, lalu kartu spesial. Water Bucket & Lava Cat tidak pernah
// dimainkan manual jadi taruh paling akhir / tetap tampil tapi disabled.
const GROUP_ORDER: CardType[] = [
  ...GANG_TYPES,
  "FREEZE", "NAP_TIME", "ERUPTION", "REVERSE", "EARTHQUAKE", "SPY_CAT",
  "BRIBE", "SNIPER", "PEEK_AND_SWAP", "BUNKER", "PICKPOCKET",
  "FLOOD", "TIME_WARP", "LOCKDOWN",
  "WATER_BUCKET", "LAVA_CAT",
];

interface CardGroup {
  type: CardType;
  cards: Card[];
}

function groupHand(hand: Card[]): CardGroup[] {
  const map = new Map<CardType, Card[]>();
  for (const card of hand) {
    const list = map.get(card.type as CardType) ?? [];
    list.push(card);
    map.set(card.type as CardType, list);
  }
  // Urutkan sesuai GROUP_ORDER, tapi tetap tampilkan tipe yang tidak ada di
  // daftar (jaga-jaga ada tipe baru di masa depan) di akhir.
  const ordered: CardGroup[] = [];
  for (const type of GROUP_ORDER) {
    const cards = map.get(type);
    if (cards && cards.length > 0) {
      ordered.push({ type, cards });
      map.delete(type);
    }
  }
  for (const [type, cards] of map) {
    ordered.push({ type, cards });
  }
  return ordered;
}

// Untuk satu grup gang card dengan N kartu sejenis, tentukan kombinasi tercepat
// yang bisa langsung "auto-play" tanpa perlu select manual satu-satu.
function getQuickGangAction(count: number): { playCount: number; label: string; needsTarget: boolean } | null {
  if (count >= 4) return { playCount: 4, label: "🔥 Quad", needsTarget: false };
  if (count === 3) return { playCount: 3, label: "🎯 Triple", needsTarget: true };
  if (count === 2) return { playCount: 2, label: "👥 Pair", needsTarget: true };
  return null;
}

export function PlayerHand({ hand, isMyTurn, onPlayCard, onPlayGang, hasPendingAction }: PlayerHandProps) {
  const { selectedCards, toggleCardSelection, clearSelection } = useGameStore();

  const groups = useMemo(() => groupHand(hand), [hand]);

  // Rainbow check: 5 gang card dengan 5 tipe berbeda, dihitung lintas grup
  const rainbowAvailable = useMemo(() => {
    const gangTypesInHand = new Set(
      hand.filter(c => isGangCard(c.type)).map(c => c.type)
    );
    return gangTypesInHand.size === 5;
  }, [hand]);

  function pickOneCardPerType(types: CardType[]): string[] {
    const ids: string[] = [];
    for (const type of types) {
      const card = hand.find(c => c.type === type && !ids.includes(c.id));
      if (card) ids.push(card.id);
    }
    return ids;
  }

  // Detect valid gang combos from MANUAL selection (tetap didukung untuk fleksibilitas,
  // misal user mau triple tapi dari 4 kartu yang dipunya — pilih manual 3 dari 4)
  const gangValidation = useMemo(() => {
    if (selectedCards.length < 2) return { valid: false, reason: "", needsTarget: false };
    const selectedCardObjs = hand.filter(c => selectedCards.includes(c.id));
    const allGang = selectedCardObjs.every(c => isGangCard(c.type));
    if (!allGang) return { valid: false, reason: "Hanya gang card yang bisa dikombinasi", needsTarget: false };

    const types = new Set(selectedCardObjs.map(c => c.type));
    if (selectedCardObjs.length === 5 && types.size === 5) {
      return { valid: true, reason: "🌈 Rainbow Gang — Full Riot! Swap tangan!", needsTarget: true };
    }
    if (types.size === 1 && [2, 3, 4].includes(selectedCardObjs.length)) {
      const labels: Record<number, { text: string; needsTarget: boolean }> = {
        2: { text: "👥 Pair — Steal random!", needsTarget: true },
        3: { text: "🎯 Triple — Steal random dari target!", needsTarget: true },
        4: { text: "🔥 Quad — Steal dari semua!", needsTarget: false },
      };
      const l = labels[selectedCardObjs.length];
      return { valid: true, reason: l.text, needsTarget: l.needsTarget };
    }
    return { valid: false, reason: "Kombinasi kartu tidak valid", needsTarget: false };
  }, [selectedCards, hand]);

  function handleCardClick(card: Card) {
    if (!isMyTurn || hasPendingAction) return;

    if (isGangCard(card.type)) {
      toggleCardSelection(card.id);
      return;
    }

    if (selectedCards.length > 0) clearSelection();

    const needsTarget = NEEDS_TARGET.includes(card.type as CardType);
    onPlayCard(card.id, needsTarget);
  }

  function handlePlayGangClick() {
    if (gangValidation.valid) {
      onPlayGang(selectedCards, gangValidation.needsTarget);
      clearSelection();
    }
  }

  // Quick-play: langsung mainkan N kartu pertama dari grup tanpa perlu select manual.
  function handleQuickGang(type: CardType, count: number, needsTarget: boolean) {
    if (!isMyTurn || hasPendingAction) return;
    const ids = hand.filter(c => c.type === type).slice(0, count).map(c => c.id);
    clearSelection();
    onPlayGang(ids, needsTarget);
  }

  function handleQuickRainbow() {
    if (!isMyTurn || hasPendingAction) return;
    const ids = pickOneCardPerType(GANG_TYPES);
    if (ids.length === 5) {
      clearSelection();
      onPlayGang(ids, true);
    }
  }

  const canInteract = isMyTurn && !hasPendingAction;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30">
      {/* Gang action bar — manual selection */}
      {selectedCards.length >= 2 && (
        <div className="flex justify-center mb-2 animate-slide-up px-4">
          <div className={clsx(
            "flex items-center gap-3 px-4 py-2 rounded-xl border shadow-xl",
            gangValidation.valid ? "bg-gold/15 border-gold" : "bg-ember/10 border-ember/50"
          )}>
            <span className={clsx("text-sm font-display", gangValidation.valid ? "text-gold" : "text-ember")}>
              {gangValidation.reason || `${selectedCards.length} kartu dipilih`}
            </span>
            {gangValidation.valid && (
              <button
                onClick={handlePlayGangClick}
                className="px-3 py-1 bg-gold text-obsidian rounded-lg text-xs font-display hover:bg-gold/90 transition-colors"
              >
                Mainkan
              </button>
            )}
            <button onClick={clearSelection} className="text-ash hover:text-cream text-xs">✕</button>
          </div>
        </div>
      )}

      {/* Rainbow quick action — selalu muncul kalau kondisi terpenuhi, lintas grup */}
      {rainbowAvailable && selectedCards.length === 0 && canInteract && (
        <div className="flex justify-center mb-2 animate-slide-up px-4">
          <button
            onClick={handleQuickRainbow}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gold bg-gold/10
                       text-gold text-sm font-display hover:bg-gold/20 transition-colors animate-glow-pulse"
          >
            🌈 Full Riot Tersedia — Mainkan Rainbow Gang!
          </button>
        </div>
      )}

      {/* Hand cards — grouped by type, horizontal scroll (fixed height, tidak pernah menutupi area lain) */}
      <div className="bg-gradient-to-t from-obsidian via-obsidian/95 to-transparent pt-6 pb-4">
        {hand.length === 0 ? (
          <p className="text-ash text-sm py-8 text-center">Tidak ada kartu di tangan</p>
        ) : (
          <div className="overflow-x-auto overflow-y-visible px-4 pb-1 max-w-full">
            <div className="flex items-end gap-1 w-max mx-auto min-w-full justify-center">
              {groups.map((group, groupIdx) => {
                const isGang = isGangCard(group.type);
                const quickAction = isGang ? getQuickGangAction(group.cards.length) : null;

                return (
                  <div key={group.type} className="flex items-end gap-0.5 relative">
                    {/* Separator antar grup (kecuali grup pertama) */}
                    {groupIdx > 0 && (
                      <div className="self-stretch w-px bg-card-border/50 mx-1.5 my-2" />
                    )}

                    {/* Quick-play badge di atas grup gang card yang punya kombinasi valid */}
                    {quickAction && canInteract && (
                      <button
                        onClick={() => handleQuickGang(group.type, quickAction.playCount, quickAction.needsTarget)}
                        className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap
                                   px-2 py-0.5 rounded-full bg-gold/90 text-obsidian text-[10px] font-display
                                   hover:bg-gold transition-colors shadow-md z-20"
                      >
                        {quickAction.label}
                      </button>
                    )}

                    {group.cards.map((card, i) => (
                      <div
                        key={card.id}
                        className="animate-card-deal flex-shrink-0"
                        style={{
                          animationDelay: `${(groupIdx * 3 + i) * 0.03}s`,
                          marginLeft: i > 0 ? "-28px" : "0",
                          zIndex: selectedCards.includes(card.id) ? 50 : i,
                        }}
                      >
                        <GameCard
                          card={card}
                          selected={selectedCards.includes(card.id)}
                          disabled={!canInteract || card.type === "LAVA_CAT" || card.type === "WATER_BUCKET"}
                          onClick={() => handleCardClick(card)}
                        />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
