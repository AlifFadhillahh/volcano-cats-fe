"use client";
import { useEffect, useState } from "react";
import clsx from "clsx";

interface TurnTimerProps {
  turnEndsAt: number | null;
  isMyTurn: boolean;
  isLocked: boolean; // pemain kena Lockdown — harus draw, tidak bisa main kartu
}

// Timer bar yang muncul di turn pemain aktif, countdown mundur sesuai
// timestamp server (turnEndsAt). Juga kasih visual cue saat kena Lockdown:
// bar berubah warna merah + teks beda (karena satu-satunya aksi valid adalah draw).
export function TurnTimer({ turnEndsAt, isMyTurn, isLocked }: TurnTimerProps) {
  const [remainingMs, setRemainingMs] = useState<number>(0);

  useEffect(() => {
    if (!turnEndsAt || !isMyTurn) {
      setRemainingMs(0);
      return;
    }

    const tick = () => setRemainingMs(Math.max(0, turnEndsAt - Date.now()));
    tick();
    const interval = setInterval(tick, 100);
    return () => clearInterval(interval);
  }, [turnEndsAt, isMyTurn]);

  if (!isMyTurn || !turnEndsAt) return null;

  const totalMs = 10_000; // harus sinkron dengan TURN_TIMEOUT_MS di backend
  const progress = Math.max(0, Math.min(1, remainingMs / totalMs));
  const secondsLeft = Math.ceil(remainingMs / 1000);
  const isUrgent = secondsLeft <= 3;

  return (
    <div className="flex flex-col items-center gap-1.5 w-full max-w-xs mx-auto">
      {/* Label */}
      <p className={clsx(
        "text-xs font-display tracking-wide transition-colors",
        isLocked ? "text-ember" :
        isUrgent ? "text-ember animate-glow-pulse" : "text-gold"
      )}>
        {isLocked
          ? `🔒 Kena Lockdown — hanya bisa draw! (${secondsLeft}s)`
          : isUrgent
          ? `⚡ Segera bertindak! ${secondsLeft}s`
          : `⏱ Giliranmu — ${secondsLeft} detik`}
      </p>

      {/* Progress bar */}
      <div className="relative w-full h-1.5 bg-obsidian-2 rounded-full overflow-hidden">
        <div
          className={clsx(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-100 ease-linear",
            isLocked ? "bg-ember" :
            isUrgent ? "bg-ember" : "bg-gold"
          )}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
