"use client";
import { Card } from "@/types/game";
import clsx from "clsx";

interface FreezeButtonProps {
  hand: Card[];
  onFreeze: () => void;
  visible: boolean;
}

export function FreezeButton({ hand, onFreeze, visible }: FreezeButtonProps) {
  const hasFreeze = hand.some(c => c.type === "FREEZE");
  if (!hasFreeze || !visible) return null;

  return (
    <button
      onClick={onFreeze}
      className={clsx(
        "fixed bottom-40 right-4 z-40 flex items-center gap-2 px-4 py-3 rounded-full",
        "bg-blue-500/20 border-2 border-blue-300 text-blue-200",
        "hover:bg-blue-500/30 hover:scale-105 active:scale-95",
        "transition-all duration-200 shadow-[0_0_20px_rgba(133,193,233,0.4)]",
        "animate-bounce-in"
      )}
    >
      <span className="text-xl">❄️</span>
      <span className="font-display text-sm">Freeze!</span>
    </button>
  );
}
