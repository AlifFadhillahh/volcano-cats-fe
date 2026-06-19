"use client";
import { Card } from "@/types/game";
import { GameCard } from "@/components/game/GameCard";

interface BribeModalProps {
  myHand: Card[];
  initiatorName: string;
  onGiveCard: (cardId: string) => void;
}

export function BribeModal({ myHand, initiatorName, onGiveCard }: BribeModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-obsidian-3 border border-gold/40 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-bounce-in">
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">🎁</div>
          <h3 className="font-display text-gold text-xl">Bribe!</h3>
          <p className="text-ash text-sm mt-1">
            <span className="text-cream">{initiatorName}</span> minta 1 kartu darimu. Pilih kartu untuk diberikan:
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center max-h-64 overflow-y-auto py-2">
          {myHand.map(card => (
            <GameCard key={card.id} card={card} small onClick={() => onGiveCard(card.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}
