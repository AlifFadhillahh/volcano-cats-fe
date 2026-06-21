"use client";
import { useEffect, useState } from "react";
import { Card } from "@/types/game";
import clsx from "clsx";

interface FreezeButtonProps {
  hand: Card[];
  onFreeze: () => void;
  visible: boolean;
  freezeWindowEndsAt?: number; // epoch ms dari server — kapan window berakhir
  initiatorName?: string;
}

export function FreezeButton({ hand, onFreeze, visible, freezeWindowEndsAt, initiatorName }: FreezeButtonProps) {
  const hasFreeze = hand.some(c => c.type === "FREEZE");
  const [remainingMs, setRemainingMs] = useState<number>(
    freezeWindowEndsAt ? Math.max(0, freezeWindowEndsAt - Date.now()) : 0
  );

  // Update countdown setiap 100ms berdasarkan timestamp ABSOLUT dari server
  // (freezeWindowEndsAt), bukan hitung mundur lokal — supaya tidak ngaco kalau
  // ada lag jaringan atau tab di-background lalu di-foreground lagi.
  useEffect(() => {
    if (!freezeWindowEndsAt) return;
    const tick = () => setRemainingMs(Math.max(0, freezeWindowEndsAt - Date.now()));
    tick();
    const interval = setInterval(tick, 100);
    return () => clearInterval(interval);
  }, [freezeWindowEndsAt]);

  if (!visible || !freezeWindowEndsAt) return null;

  const totalMs = 4000; // harus sinkron dengan FREEZE_WINDOW_MS di backend
  const progress = Math.max(0, Math.min(1, remainingMs / totalMs));
  const secondsLeft = Math.ceil(remainingMs / 1000);

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-bounce-in w-[90%] max-w-sm">
      <div className={clsx(
        "rounded-2xl border-2 overflow-hidden shadow-2xl",
        hasFreeze ? "border-blue-300 bg-obsidian-3" : "border-card-border bg-obsidian-3/90"
      )}>
        {/* Progress bar countdown */}
        <div className="h-1.5 bg-obsidian-2 relative overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 to-blue-200 transition-all duration-100 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <div className="p-3 flex items-center gap-3">
          <span className="text-2xl flex-shrink-0">❄️</span>
          <div className="flex-1 min-w-0">
            <p className="text-cream text-sm font-display truncate">
              {initiatorName ? `${initiatorName} memainkan kartu...` : "Kartu sedang dimainkan..."}
            </p>
            <p className="text-ash text-xs">
              {hasFreeze ? `${secondsLeft} detik tersisa untuk Freeze` : "Kamu tidak punya kartu Freeze"}
            </p>
          </div>
          {hasFreeze && (
            <button
              onClick={onFreeze}
              className="flex-shrink-0 px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-300
                         text-blue-200 font-display text-sm hover:bg-blue-500/30 active:scale-95
                         transition-all duration-150"
            >
              Freeze!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
