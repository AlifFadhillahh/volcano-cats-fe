"use client";
import { useGameStore } from "@/store/gameStore";

export function TargetingBanner({ onCancel }: { onCancel: () => void }) {
  const { targetingMode, pendingCardId } = useGameStore();

  if (!targetingMode) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 animate-slide-up">
      <div className="flex items-center gap-3 bg-gold/15 border border-gold rounded-xl px-4 py-2.5 shadow-gold-glow">
        <span className="text-gold text-sm font-display tracking-wide">
          🎯 Pilih target — klik avatar pemain
        </span>
        <button
          onClick={onCancel}
          className="text-ash hover:text-cream text-xs underline"
        >
          Batal
        </button>
      </div>
    </div>
  );
}
