"use client";
import { useEffect, useRef } from "react";
import { GameLogEntry } from "@/types/game";
import clsx from "clsx";

const LOG_COLORS = {
  action: "text-ash-light",
  death:  "text-ember",
  system: "text-gold/80",
  win:    "text-gold",
};

const LOG_ICONS = {
  action: "▸",
  death:  "💀",
  system: "⚙️",
  win:    "🏆",
};

export function GameLog({ entries, visible }: { entries: GameLogEntry[]; visible: boolean }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  return (
    <div className={clsx(
      "fixed right-0 top-0 h-full w-72 bg-obsidian-2 border-l border-card-border",
      "flex flex-col transition-transform duration-300 z-40",
      visible ? "translate-x-0" : "translate-x-full",
    )}>
      <div className="px-4 py-3 border-b border-card-border">
        <h3 className="font-display text-gold text-sm tracking-wide">📜 Game Log</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5">
        {entries.map((entry, i) => (
          <div key={i} className={clsx("text-xs leading-relaxed animate-slide-up", LOG_COLORS[entry.type])}>
            <span className="mr-1 opacity-60">{LOG_ICONS[entry.type]}</span>
            {entry.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
