"use client";
import { useGameStore } from "@/store/gameStore";
import clsx from "clsx";

const TOAST_STYLES = {
  info:    "border-ash/40 bg-obsidian-3 text-cream",
  error:   "border-ember/60 bg-ember/10 text-cream",
  success: "border-gang-earth/60 bg-gang-earth/10 text-cream",
  death:   "border-ember bg-ember/20 text-cream",
  warning: "border-gold/60 bg-gold/10 text-cream",
};

export function NotificationToasts() {
  const { notifications, dismissNotification } = useGameStore();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
      {notifications.map(n => (
        <div
          key={n.id}
          className={clsx(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl border shadow-xl",
            "font-body text-sm max-w-sm text-center animate-bounce-in pointer-events-auto",
            TOAST_STYLES[n.type],
          )}
          onClick={() => dismissNotification(n.id)}
        >
          {n.emoji && <span>{n.emoji}</span>}
          <span>{n.message}</span>
        </div>
      ))}
    </div>
  );
}
