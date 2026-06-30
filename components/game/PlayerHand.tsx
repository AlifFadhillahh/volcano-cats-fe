"use client";
import { useMemo, useState } from "react";
import { Card, CardType, isGangCard, NEEDS_TARGET, GANG_TYPES, CARD_META } from "@/types/game";
import { GameCard } from "@/components/game/GameCard";
import { getCardTheme } from "@/lib/cardTheme";
import { useGameStore } from "@/store/gameStore";
import clsx from "clsx";

interface PlayerHandProps {
  hand: Card[];
  isMyTurn: boolean;
  onPlayCard: (cardId: string, needsTarget: boolean) => void;
  onPlayGang: (cardIds: string[], needsTarget: boolean) => void;
  hasPendingAction: boolean;
  hasBunker?: boolean;
}

// ── GROUP ORDER ─────────────────────────────────────────────
const GROUP_ORDER: CardType[] = [
  ...GANG_TYPES,
  "FREEZE", "NAP_TIME", "ERUPTION", "REVERSE", "EARTHQUAKE", "SPY_CAT",
  "BRIBE", "SNIPER", "PEEK_AND_SWAP", "BUNKER", "PICKPOCKET",
  "FLOOD", "TIME_WARP", "LOCKDOWN",
  "WATER_BUCKET", "LAVA_CAT",
];

interface CardGroup { type: CardType; cards: Card[]; }

function groupHand(hand: Card[]): CardGroup[] {
  const map = new Map<CardType, Card[]>();
  for (const card of hand) {
    const list = map.get(card.type as CardType) ?? [];
    list.push(card);
    map.set(card.type as CardType, list);
  }
  const ordered: CardGroup[] = [];
  for (const type of GROUP_ORDER) {
    const cards = map.get(type);
    if (cards?.length) { ordered.push({ type, cards }); map.delete(type); }
  }
  for (const [type, cards] of map) ordered.push({ type, cards });
  return ordered;
}

function getQuickGangAction(count: number): { playCount: number; label: string; needsTarget: boolean } | null {
  if (count >= 4) return { playCount: 4, label: "🔥 Quad", needsTarget: false };
  if (count === 3) return { playCount: 3, label: "🎯 Triple", needsTarget: true };
  if (count === 2) return { playCount: 2, label: "👥 Pair", needsTarget: true };
  return null;
}

export function PlayerHand({ hand, isMyTurn, onPlayCard, onPlayGang, hasPendingAction, hasBunker }: PlayerHandProps) {
  const { selectedCards, toggleCardSelection, clearSelection } = useGameStore();
  const [hoveredCard, setHoveredCard] = useState<Card | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const groups = useMemo(() => groupHand(hand), [hand]);

  const rainbowAvailable = useMemo(() => {
    const types = new Set(hand.filter(c => isGangCard(c.type)).map(c => c.type));
    return types.size === 5;
  }, [hand]);

  const gangValidation = useMemo(() => {
    if (selectedCards.length < 2) return { valid: false, reason: "", needsTarget: false };
    const sel = hand.filter(c => selectedCards.includes(c.id));
    if (!sel.every(c => isGangCard(c.type))) {
      return { valid: false, reason: "Hanya gang card yang bisa dikombinasi", needsTarget: false };
    }
    const types = new Set(sel.map(c => c.type));
    if (sel.length === 5 && types.size === 5)
      return { valid: true, reason: "🌈 Rainbow — Swap tangan!", needsTarget: true };
    if (types.size === 1 && [2,3,4].includes(sel.length)) {
      const labels: Record<number, { text: string; needsTarget: boolean }> = {
        2: { text: "👥 Pair — Steal random!", needsTarget: true },
        3: { text: "🎯 Triple — Steal dari target!", needsTarget: true },
        4: { text: "🔥 Quad — Steal dari semua!", needsTarget: false },
      };
      const l = labels[sel.length];
      return { valid: true, reason: l.text, needsTarget: l.needsTarget };
    }
    return { valid: false, reason: "Kombinasi tidak valid", needsTarget: false };
  }, [selectedCards, hand]);

  function handleCardClick(card: Card) {
    if (!isMyTurn || hasPendingAction) return;
    if (isGangCard(card.type)) { toggleCardSelection(card.id); return; }
    if (selectedCards.length > 0) clearSelection();
    onPlayCard(card.id, NEEDS_TARGET.includes(card.type as CardType));
  }

  function handlePlayGangClick() {
    if (gangValidation.valid) { onPlayGang(selectedCards, gangValidation.needsTarget); clearSelection(); }
  }

  function handleQuickGang(type: CardType, count: number, needsTarget: boolean) {
    if (!isMyTurn || hasPendingAction) return;
    const ids = hand.filter(c => c.type === type).slice(0, count).map(c => c.id);
    clearSelection();
    onPlayGang(ids, needsTarget);
  }

  function handleQuickRainbow() {
    if (!isMyTurn || hasPendingAction) return;
    const ids: string[] = [];
    for (const t of GANG_TYPES) {
      const c = hand.find(card => card.type === t && !ids.includes(card.id));
      if (c) ids.push(c.id);
    }
    if (ids.length === 5) { clearSelection(); onPlayGang(ids, true); }
  }

  const canInteract = isMyTurn && !hasPendingAction;
  const totalCards = hand.length;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30"
      onMouseMove={e => setMousePos({ x: e.clientX, y: e.clientY })}
      onMouseLeave={() => setHoveredCard(null)}
    >
      {/* ── YOUR HAND PANEL ─────────────────────────────── */}
      <div className="bg-[#0d1117] border-t border-[#1e2530]" style={{ minHeight: 164 }}>

        {/* Panel header — ala referensi */}
        <div className="flex items-center justify-between px-4 pt-2.5 pb-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#4a5568] uppercase tracking-[0.15em]">YOUR HAND</span>
            {hasBunker && (
              <span className="text-[10px] bg-[#1a2535] border border-[#2a3a55] rounded-full px-2 py-0.5 font-mono text-blue-300">
                🛡️ Bunker
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-[#4a5568]">
            {totalCards} card{totalCards !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Action bars */}
        {selectedCards.length >= 2 && (
          <div className="flex justify-center pb-1 px-4">
            <div className={clsx(
              "flex items-center gap-3 px-3 py-1.5 rounded-lg border text-xs",
              gangValidation.valid
                ? "bg-gold/10 border-gold/40 text-gold"
                : "bg-red-900/20 border-red-800/40 text-red-400"
            )}>
              <span className="font-display">{gangValidation.reason || `${selectedCards.length} dipilih`}</span>
              {gangValidation.valid && (
                <button onClick={handlePlayGangClick}
                  className="bg-gold text-obsidian px-2.5 py-0.5 rounded font-display text-[10px] hover:bg-gold/90">
                  Play
                </button>
              )}
              <button onClick={clearSelection} className="text-current opacity-60 hover:opacity-100">✕</button>
            </div>
          </div>
        )}

        {rainbowAvailable && selectedCards.length === 0 && canInteract && (
          <div className="flex justify-center pb-1 px-4">
            <button onClick={handleQuickRainbow}
              className="text-[11px] font-display text-gold border border-gold/40 bg-gold/10 rounded-full px-3 py-1 animate-glow-pulse">
              🌈 Rainbow Gang tersedia!
            </button>
          </div>
        )}

        {/* ── CARDS SCROLL AREA ─────────────────────────── */}
        {hand.length === 0 ? (
          <p className="text-[#4a5568] text-xs text-center py-6 font-mono">No cards</p>
        ) : (
          <div
            className="overflow-x-auto px-4 pb-3"
            style={{ overflowY: "visible", paddingTop: 12 }}
          >
            <div className="flex items-end gap-0.5 w-max mx-auto min-w-full justify-center">
              {groups.map((group, groupIdx) => {
                const isGang = isGangCard(group.type);
                const quickAction = isGang ? getQuickGangAction(group.cards.length) : null;

                return (
                  <div key={group.type} className="flex items-end gap-0.5 relative">
                    {groupIdx > 0 && (
                      <div className="self-stretch w-px bg-[#1e2530] mx-2 my-1" />
                    )}

                    {/* Quick gang badge */}
                    {quickAction && canInteract && (
                      <button
                        onClick={() => handleQuickGang(group.type, quickAction.playCount, quickAction.needsTarget)}
                        className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap
                                   px-1.5 py-0.5 rounded text-[9px] font-mono
                                   bg-[#1e2d1a] border border-green-800/60 text-green-400
                                   hover:bg-[#243520] transition-colors z-20"
                      >
                        {quickAction.label}
                      </button>
                    )}

                    {group.cards.map((card, i) => (
                      <div
                        key={card.id}
                        className="animate-card-deal flex-shrink-0 relative"
                        style={{
                          animationDelay: `${(groupIdx * 3 + i) * 0.03}s`,
                          marginLeft: i > 0 ? "-30px" : "0",
                          zIndex: selectedCards.includes(card.id) ? 50 : hoveredCard?.id === card.id ? 40 : i,
                        }}
                      >
                        <GameCard
                          card={card}
                          selected={selectedCards.includes(card.id)}
                          disabled={!canInteract || card.type === "LAVA_CAT" || card.type === "WATER_BUCKET"}
                          onClick={() => handleCardClick(card)}
                          onHoverChange={(hovering) => setHoveredCard(hovering ? card : null)}
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

      {/* ── TOOLTIP — fixed, tidak kena clip ─────────────── */}
      {hoveredCard && mousePos.x > 0 && (
        <div
          className="fixed z-[100] pointer-events-none"
          style={{
            left: `clamp(8px, ${mousePos.x - 104}px, calc(100vw - 224px))`,
            top: `clamp(8px, ${mousePos.y - 210}px, calc(100vh - 180px))`,
          }}
        >
          <div
            className="bg-[#0d1117]/95 backdrop-blur-sm border rounded-xl px-4 py-3 w-52 shadow-2xl animate-slide-up"
            style={{ borderColor: CARD_META[hoveredCard.type as CardType].color + "99" }}
          >
            <p className="font-display text-sm mb-1.5" style={{ color: CARD_META[hoveredCard.type as CardType].color }}>
              {getCardTheme(hoveredCard.type as CardType).displayName}
            </p>
            <p className="text-[#8892a4] text-[11px] leading-relaxed">
              {getCardTheme(hoveredCard.type as CardType).displayDescription}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
