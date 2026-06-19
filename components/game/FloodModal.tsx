"use client";
import { Card } from "@/types/game";
import { GameCard } from "@/components/game/GameCard";

interface FloodModalProps {
  myHand: Card[];
  alreadyDiscarded: boolean;
  onDiscard: (cardId: string) => void;
}

export function FloodModal({ myHand, alreadyDiscarded, onDiscard }: FloodModalProps) {
  if (alreadyDiscarded) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-obsidian-3 border border-card-border rounded-2xl p-6 max-w-sm w-full mx-4 text-center animate-bounce-in">
          <div className="text-4xl mb-2">🌊</div>
          <p className="text-cream">Menunggu pemain lain membuang kartu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-obsidian-3 border border-blue-400/40 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-bounce-in">
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">🌊</div>
          <h3 className="font-display text-blue-300 text-xl">Flood!</h3>
          <p className="text-ash text-sm mt-1">Semua pemain harus buang 1 kartu. Pilih kartumu:</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center max-h-64 overflow-y-auto py-2">
          {myHand.map(card => (
            <GameCard key={card.id} card={card} small onClick={() => onDiscard(card.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface TimeWarpModalProps {
  discardPile: Card[];
  onPick: (cardId: string) => void;
}

export function TimeWarpModal({ discardPile, onPick }: TimeWarpModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-obsidian-3 border border-purple-400/40 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-bounce-in">
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">🪄</div>
          <h3 className="font-display text-purple-300 text-xl">Time Warp!</h3>
          <p className="text-ash text-sm mt-1">Pilih 1 kartu dari discard pile untuk diambil:</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center max-h-64 overflow-y-auto py-2">
          {discardPile.length === 0 ? (
            <p className="text-ash text-sm">Discard pile kosong.</p>
          ) : (
            discardPile.map(card => (
              <GameCard key={card.id} card={card} small onClick={() => onPick(card.id)} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
