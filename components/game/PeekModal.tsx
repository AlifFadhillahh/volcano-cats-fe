"use client";
import { useGameStore } from "@/store/gameStore";
import { GameCard } from "@/components/game/GameCard";
import { Card } from "@/types/game";

interface PeekModalProps {
  onSwapDecide?: (swap: boolean, cardId?: string) => void;
  isSwapMode?: boolean;
  myHand?: Card[];
}

export function PeekModal({ onSwapDecide, isSwapMode, myHand }: PeekModalProps) {
  const { peekCards, showPeek, setShowPeek, setPeekCards } = useGameStore();

  if (!showPeek || !peekCards) return null;

  function dismiss() {
    setShowPeek(false);
    if (!isSwapMode) setPeekCards(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-obsidian-3 border border-card-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-bounce-in">
        <h3 className="font-display text-gold text-lg text-center mb-1">
          {isSwapMode ? "👁️ Peek & Swap" : "🔭 Spy Cat"}
        </h3>
        <p className="text-ash text-xs text-center mb-4">
          {isSwapMode
            ? "Kartu teratas deck. Mau swap dengan kartu dari tanganmu?"
            : "3 kartu teratas deck (rahasia):"}
        </p>

        <div className="flex gap-3 justify-center mb-5">
          {peekCards.map((card, i) => (
            <div key={card.id} className="animate-card-deal" style={{ animationDelay: `${i * 0.1}s` }}>
              <GameCard card={card} small={false} />
            </div>
          ))}
        </div>

        {isSwapMode && myHand && onSwapDecide ? (
          <div>
            <p className="text-ash text-xs text-center mb-3">Pilih kartu dari tanganmu untuk di-swap:</p>
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {myHand.slice(0, 6).map(card => (
                <GameCard
                  key={card.id}
                  card={card}
                  small
                  onClick={() => {
                    onSwapDecide(true, card.id);
                    dismiss();
                  }}
                />
              ))}
            </div>
            <button
              onClick={() => { onSwapDecide(false); dismiss(); }}
              className="w-full py-2 border border-card-border rounded-xl text-ash hover:text-cream transition-colors text-sm"
            >
              Tidak swap
            </button>
          </div>
        ) : (
          <button
            onClick={dismiss}
            className="w-full py-3 rounded-xl font-display text-obsidian bg-gold-gradient hover:shadow-gold-glow transition-all"
          >
            OK, Mengerti!
          </button>
        )}
      </div>
    </div>
  );
}
