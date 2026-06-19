"use client";
import { useMemo } from "react";
import { Card, CardType, isGangCard, NEEDS_TARGET } from "@/types/game";
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

export function PlayerHand({ hand, isMyTurn, onPlayCard, onPlayGang, hasPendingAction }: PlayerHandProps) {
  const { selectedCards, toggleCardSelection, clearSelection } = useGameStore();

  // Detect valid gang combos from selection
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

    // Non-gang card: kalau ada selection aktif, clear dulu
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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30">
      {/* Gang action bar */}
      {selectedCards.length >= 2 && (
        <div className="flex justify-center mb-2 animate-slide-up">
          <div className={clsx(
            "flex items-center gap-3 px-4 py-2 rounded-xl border shadow-xl",
            gangValidation.valid
              ? "bg-gold/15 border-gold"
              : "bg-ember/10 border-ember/50"
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
            <button onClick={clearSelection} className="text-ash hover:text-cream text-xs">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Hand cards */}
      <div className="bg-gradient-to-t from-obsidian via-obsidian/95 to-transparent pt-8 pb-4 px-4">
        <div className="flex justify-center items-end gap-[-12px] flex-wrap max-w-4xl mx-auto">
          {hand.length === 0 ? (
            <p className="text-ash text-sm py-8">Tidak ada kartu di tangan</p>
          ) : (
            hand.map((card, i) => (
              <div
                key={card.id}
                className="animate-card-deal"
                style={{
                  animationDelay: `${i * 0.04}s`,
                  marginLeft: i > 0 ? "-12px" : "0",
                  zIndex: selectedCards.includes(card.id) ? 50 : i,
                }}
              >
                <GameCard
                  card={card}
                  selected={selectedCards.includes(card.id)}
                  disabled={!isMyTurn || hasPendingAction || card.type === "LAVA_CAT" || card.type === "WATER_BUCKET"}
                  onClick={() => handleCardClick(card)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
