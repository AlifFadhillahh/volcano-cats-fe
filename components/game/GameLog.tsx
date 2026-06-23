"use client";
import { useEffect, useRef } from "react";
import { GameLogEntry } from "@/types/game";
import clsx from "clsx";

type LogType = GameLogEntry["type"];

const LOG_COLORS: Record<LogType, string> = {
  action: "text-ash-light",
  death:  "text-ember",
  system: "text-gold/80",
  win:    "text-gold",
};

const LOG_ICONS: Record<LogType, string> = {
  action: "▸",
  death:  "💀",
  system: "⚙️",
  win:    "🏆",
};

interface GameLogProps {
  entries: GameLogEntry[];
  visible: boolean;
  onClose: () => void;
}

// Floating panel kecil di pojok kanan atas, BUKAN sidebar full-height —
// supaya selalu ada tombol close yang jelas terlihat di dalam panel itu
// sendiri (sebelumnya cuma mengandalkan toggle eksternal di top bar, yang
// bisa tertutup/terhalang panel saat panel sedang terbuka).
export function GameLog({ entries, visible, onClose }: GameLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries, visible]);

  if (!visible) return null;

  return (
    <div className="fixed top-16 right-4 z-40 w-72 max-h-[60vh] bg-obsidian-2 border border-card-border
                     rounded-2xl shadow-2xl flex flex-col animate-slide-up overflow-hidden">
      <div className="px-4 py-3 border-b border-card-border flex items-center justify-between flex-shrink-0">
        <h3 className="font-display text-gold text-sm tracking-wide">📜 Game Log</h3>
        <button
          onClick={onClose}
          className="text-ash hover:text-cream w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors"
          aria-label="Tutup log"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5 min-h-0">
        {entries.length === 0 ? (
          <p className="text-ash text-xs text-center py-4">Belum ada aktivitas</p>
        ) : (
          entries.map((entry, i) => (
            <div key={i} className={clsx("text-xs leading-relaxed animate-slide-up", LOG_COLORS[entry.type])}>
              <span className="mr-1 opacity-60">{LOG_ICONS[entry.type]}</span>
              {entry.message}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
