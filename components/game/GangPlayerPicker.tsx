"use client";
import { ClientPlayer } from "@/types/game";
import clsx from "clsx";

interface GangPlayerPickerProps {
  title: string;
  description: string;
  emoji: string;
  players: ClientPlayer[];
  excludeId: string;
  onPick: (targetId: string) => void;
  onCancel: () => void;
}

export function GangPlayerPicker({ title, description, emoji, players, excludeId, onPick, onCancel }: GangPlayerPickerProps) {
  const candidates = players.filter(p => p.sessionId !== excludeId && p.isAlive);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-obsidian-3 border border-card-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-bounce-in">
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">{emoji}</div>
          <h3 className="font-display text-gold text-xl">{title}</h3>
          <p className="text-ash text-sm mt-1">{description}</p>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          {candidates.map(p => (
            <button
              key={p.sessionId}
              onClick={() => onPick(p.sessionId)}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl border border-card-border",
                "hover:border-gold hover:bg-gold/5 transition-all text-left"
              )}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-display text-sm"
                style={{ background: `hsl(${p.username.charCodeAt(0) * 15},60%,40%)` }}
              >
                {p.username.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-cream text-sm flex-1">{p.username}</span>
              <span className="text-ash text-xs">{p.handCount} kartu</span>
            </button>
          ))}
        </div>

        <button onClick={onCancel} className="w-full py-2 text-ash hover:text-cream text-sm transition-colors">
          Batal
        </button>
      </div>
    </div>
  );
}
