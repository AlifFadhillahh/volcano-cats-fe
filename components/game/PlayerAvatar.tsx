"use client";
import clsx from "clsx";
import { ClientPlayer } from "@/types/game";

const AVATAR_COLORS = [
  "#FF5C1A","#FFB547","#5CE0FF","#B05CFF","#5CFF8A",
  "#FF5C8A","#5C8AFF","#FF5CE0","#8AFF5C","#FFE05C",
];

function getAvatarColor(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface PlayerAvatarProps {
  player: ClientPlayer;
  isCurrentTurn: boolean;
  isMe: boolean;
  isDying?: boolean;
  onClick?: () => void;
  targeting?: boolean;
}

export function PlayerAvatar({ player, isCurrentTurn, isMe, isDying, onClick, targeting }: PlayerAvatarProps) {
  const color = getAvatarColor(player.username);
  const initials = player.username.slice(0, 2).toUpperCase();

  return (
    <div
      className={clsx(
        "flex flex-col items-center gap-1.5 transition-all duration-300",
        !player.isAlive && "opacity-30",
        targeting && player.isAlive && !isMe && "cursor-pointer scale-110",
        isDying && "animate-death-flash",
      )}
      onClick={targeting && player.isAlive && !isMe ? onClick : undefined}
    >
      {/* Turn indicator ring */}
      <div className={clsx(
        "relative rounded-full p-0.5 transition-all duration-300",
        isCurrentTurn ? "animate-lava-pulse" : "bg-transparent",
      )}
        style={{ background: isCurrentTurn ? `conic-gradient(${color}, transparent)` : "transparent" }}
      >
        {/* Avatar circle */}
        <div
          className={clsx(
            "relative w-12 h-12 rounded-full flex items-center justify-center font-display text-lg",
            "border-2 transition-all duration-200",
            targeting && player.isAlive && !isMe && "ring-2 ring-gold ring-offset-2 ring-offset-obsidian",
          )}
          style={{
            background: `${color}22`,
            borderColor: player.isAlive ? color : "#3A3A55",
            color,
          }}
        >
          {player.isAlive ? initials : "💀"}

          {/* Bunker shield — lebih prominent, ada tooltip */}
          {player.hasBunker && (
            <div
              className="absolute -top-2 -right-2 text-base animate-bounce-in"
              title="Bunker aktif — melindungi dari Lava Cat berikutnya"
            >
              🛡️
            </div>
          )}

          {/* Locked indicator */}
          {player.isLocked && (
            <div className="absolute -bottom-1 -right-1 text-sm">🔒</div>
          )}

          {/* Away (manual) */}
          {player.away && player.isAlive && (
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center text-xs">😴</div>
          )}

          {/* Disconnected (otomatis) — beda dari away manual, prioritas tampil duluan kalau dua-duanya true */}
          {!player.connected && player.isAlive && (
            <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center text-xs">📡</div>
          )}
        </div>
      </div>

      {/* Name */}
      <div className="text-center">
        <p className={clsx(
          "font-display text-[11px] tracking-wide max-w-[72px] truncate",
          isMe ? "text-gold" : "text-cream",
          !player.isAlive && "line-through",
        )}>
          {player.username}{isMe ? " (kamu)" : ""}
        </p>
        {/* Card count + status */}
        {player.isAlive && (
          <p className="text-ash text-[10px]">
            {!player.connected
              ? "Offline · auto-play"
              : player.away
              ? "Away · auto-play"
              : player.hasBunker
              ? "🛡️ Bunker"
              : `${player.handCount} kartu`}
          </p>
        )}
      </div>
    </div>
  );
}
