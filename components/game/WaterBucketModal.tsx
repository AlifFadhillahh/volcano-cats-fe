"use client";
import { useState } from "react";

interface WaterBucketModalProps {
  deckCount: number;
  onConfirm: (position: number) => void;
}

export function WaterBucketModal({ deckCount, onConfirm }: WaterBucketModalProps) {
  const [position, setPosition] = useState(Math.floor(deckCount / 2));

  const posLabel =
    position === 0 ? "Paling atas (berbahaya! 😈)" :
    position === deckCount ? "Paling bawah (aman 😌)" :
    `Posisi ${position} dari atas (${deckCount - position} dari bawah)`;

  function handleRandom() {
    const rand = Math.floor(Math.random() * (deckCount + 1));
    onConfirm(rand);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-obsidian-3 border border-lava/40 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-bounce-in animate-lava-pulse">
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">💧</div>
          <h3 className="font-display text-lava text-xl">Water Bucket Aktif!</h3>
          <p className="text-ash text-sm mt-1">
            Kamu selamat dari Lava Cat. Taruh balik di posisi mana?
          </p>
        </div>

        {/* Position slider */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-ash mb-1">
            <span>🔝 Atas (berbahaya)</span>
            <span>⬇️ Bawah (aman)</span>
          </div>
          <input
            type="range"
            min={0}
            max={deckCount}
            value={position}
            onChange={e => setPosition(parseInt(e.target.value))}
            className="w-full accent-lava"
          />
          <p className="text-center text-sm text-gold mt-2 font-display">{posLabel}</p>
          <p className="text-center text-xs text-ash mt-1">Deck: {deckCount} kartu</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRandom}
            className="flex-1 py-3 rounded-xl font-display text-ash-light border border-card-border
                       hover:border-ash-light hover:text-cream transition-all active:scale-95 text-sm"
          >
            🎲 Acak
          </button>
          <button
            onClick={() => onConfirm(position)}
            className="flex-[2] py-3 rounded-xl font-display text-white bg-lava-gradient hover:shadow-lava-glow transition-all active:scale-95"
          >
            🌋 Taruh di Sini
          </button>
        </div>
      </div>
    </div>
  );
}
