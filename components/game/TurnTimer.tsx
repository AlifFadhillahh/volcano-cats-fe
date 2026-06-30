"use client";
import { useEffect, useState, useRef } from "react";
import clsx from "clsx";

interface TurnTimerProps {
  turnEndsAt: number | null;
  isMyTurn: boolean;
  isLocked: boolean;
  currentPlayerName?: string;
}

export function TurnTimer({ turnEndsAt, isMyTurn, isLocked, currentPlayerName }: TurnTimerProps) {
  const [remainingMs, setRemainingMs] = useState<number>(10_000);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Clear interval lama dulu
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!turnEndsAt) {
      setRemainingMs(10_000);
      return;
    }

    const tick = () => setRemainingMs(Math.max(0, turnEndsAt - Date.now()));
    tick(); // langsung update sekali
    intervalRef.current = setInterval(tick, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [turnEndsAt]); // re-run setiap turnEndsAt berubah (giliran baru)

  if (!turnEndsAt) return null;

  const totalMs = 10_000;
  const progress = Math.max(0, Math.min(1, remainingMs / totalMs));
  const secondsLeft = Math.ceil(remainingMs / 1000);
  const isUrgent = secondsLeft <= 3;

  const barColor = isUrgent ? "bg-ember" : isMyTurn ? "bg-gold" : "bg-blue-400";
  const textColor = isUrgent ? "text-ember animate-glow-pulse" : isMyTurn ? "text-gold" : "text-blue-300";

  let label: string;
  if (isMyTurn && isLocked) label = `🔒 Lockdown — wajib draw! ${secondsLeft}s`;
  else if (isMyTurn && isUrgent) label = `⚡ Segera bertindak! ${secondsLeft}s`;
  else if (isMyTurn) label = `⏱ Giliranmu — ${secondsLeft}s`;
  else label = `⏱ Giliran ${currentPlayerName ?? "Lawan"} — ${secondsLeft}s`;

  return (
    <div className="flex flex-col items-center gap-1 w-full max-w-xs mx-auto">
      <p className={clsx("text-xs font-display tracking-wide", textColor)}>
        {label}
      </p>
      <div className="relative w-full h-2 bg-obsidian-2 rounded-full overflow-hidden">
        <div
          className={clsx("absolute inset-y-0 left-0 rounded-full transition-[width] duration-100 ease-linear", barColor)}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
