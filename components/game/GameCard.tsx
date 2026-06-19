"use client";
import { useState } from "react";
import { Card, CARD_META, CardType } from "@/types/game";
import clsx from "clsx";

interface GameCardProps {
  card: Card;
  selected?: boolean;
  disabled?: boolean;
  faceDown?: boolean;
  small?: boolean;
  onClick?: () => void;
  className?: string;
}

export function GameCard({
  card, selected = false, disabled = false,
  faceDown = false, small = false, onClick, className,
}: GameCardProps) {
  const [hovered, setHovered] = useState(false);
  const meta = CARD_META[card.type as CardType];

  const w = small ? "w-16" : "w-24";
  const h = small ? "h-24" : "h-36";

  return (
    <div
      className={clsx(
        "relative cursor-pointer select-none rounded-xl border transition-all duration-200",
        "card-3d-container group",
        w, h,
        selected && "card-selected",
        disabled && "opacity-40 cursor-not-allowed",
        !disabled && !selected && "hover:-translate-y-2",
        className,
      )}
      onClick={!disabled ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderColor: hovered || selected ? meta.color : "#2E2E44",
        boxShadow: selected
          ? `0 0 24px ${meta.glowColor}, 0 0 48px ${meta.glowColor.replace("0.8","0.3")}`
          : hovered
          ? `0 8px 24px rgba(0,0,0,0.6), 0 0 12px ${meta.glowColor}`
          : "0 4px 12px rgba(0,0,0,0.5)",
      }}
    >
      {faceDown ? (
        <CardBack small={small} />
      ) : (
        <CardFace card={card} meta={meta} small={small} />
      )}

      {/* Tooltip */}
      {!small && hovered && (
        <div
          className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-50
                     bg-obsidian-3 border border-card-border rounded-lg px-3 py-2
                     text-xs text-cream w-44 text-center shadow-xl pointer-events-none
                     animate-slide-up"
          style={{ borderColor: meta.color + "66" }}
        >
          <p className="font-display text-sm mb-1" style={{ color: meta.color }}>{card.name}</p>
          <p className="text-ash leading-relaxed">{card.description}</p>
        </div>
      )}
    </div>
  );
}

function CardFace({ card, meta, small }: { card: Card; meta: typeof CARD_META[CardType]; small: boolean }) {
  return (
    <div
      className="w-full h-full rounded-xl flex flex-col items-center justify-between p-2 overflow-hidden relative"
      style={{ background: meta.bgGradient }}
    >
      {/* Shine overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

      {/* Category badge */}
      {!small && (
        <div
          className="self-start text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded font-display"
          style={{ background: meta.color + "33", color: meta.color }}
        >
          {meta.category}
        </div>
      )}

      {/* Emoji */}
      <div className={clsx("text-center", small ? "text-3xl" : "text-4xl my-1")}>
        {card.emoji}
      </div>

      {/* Name */}
      {!small && (
        <div className="text-center">
          <p className="font-display text-white text-[10px] leading-tight tracking-wide uppercase">
            {card.name}
          </p>
        </div>
      )}
    </div>
  );
}

function CardBack({ small }: { small: boolean }) {
  return (
    <div className="w-full h-full rounded-xl bg-card-gradient border border-card-border flex items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 rounded-xl"
        style={{
          background: "repeating-linear-gradient(45deg, rgba(255,92,26,0.05) 0px, rgba(255,92,26,0.05) 2px, transparent 2px, transparent 10px)"
        }}
      />
      <span className={clsx("relative z-10", small ? "text-2xl" : "text-3xl")}>🌋</span>
    </div>
  );
}

// Stack of face-down cards (deck)
export function CardDeckStack({ count, onClick }: { count: number; onClick?: () => void }) {
  const stackCount = Math.min(4, Math.ceil(count / 10));
  return (
    <div className="relative cursor-pointer group" onClick={onClick}>
      {Array.from({ length: stackCount }).map((_, i) => (
        <div
          key={i}
          className="absolute w-24 h-36 rounded-xl border border-card-border bg-card-gradient"
          style={{ top: -i * 2, left: -i * 1, zIndex: i }}
        />
      ))}
      <div className="relative w-24 h-36 rounded-xl border border-lava/40 bg-card-gradient
                      flex flex-col items-center justify-center gap-1
                      group-hover:border-lava group-hover:shadow-lava-glow
                      transition-all duration-200"
        style={{ zIndex: stackCount }}
      >
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div className="w-full h-full"
            style={{
              background: "repeating-linear-gradient(45deg, rgba(255,92,26,0.05) 0px, rgba(255,92,26,0.05) 2px, transparent 2px, transparent 10px)"
            }}
          />
        </div>
        <span className="relative text-3xl">🌋</span>
        <span className="relative font-display text-lava text-sm">{count}</span>
        <span className="relative text-ash text-[9px] uppercase tracking-wider">kartu</span>
      </div>
    </div>
  );
}
