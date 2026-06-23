"use client";
import { useState } from "react";
import Image from "next/image";
import { Card, CARD_META, CardType } from "@/types/game";
import { getCardTheme } from "@/lib/cardTheme";
import clsx from "clsx";

interface GameCardProps {
  card: Card;
  selected?: boolean;
  disabled?: boolean;
  faceDown?: boolean;
  small?: boolean;
  onClick?: () => void;
  className?: string;
  // Dipanggil saat hover mulai/berakhir — dipakai parent (PlayerHand) untuk
  // menampilkan tooltip di posisi fixed terpisah, supaya tidak ke-clip oleh
  // container overflow-x-auto pada hand kartu. Opsional: kalau tidak di-pass,
  // GameCard tetap berfungsi normal tanpa tooltip (dipakai di tempat lain
  // seperti discard pile / deck preview yang tidak butuh tooltip).
  onHoverChange?: (hovering: boolean) => void;
}

export function GameCard({
  card, selected = false, disabled = false,
  faceDown = false, small = false, onClick, className, onHoverChange,
}: GameCardProps) {
  const [hovered, setHovered] = useState(false);
  const meta = CARD_META[card.type as CardType];
  const theme = getCardTheme(card.type as CardType);

  const w = small ? "w-16" : "w-24";
  const h = small ? "h-24" : "h-36";

  function handleEnter() {
    setHovered(true);
    onHoverChange?.(true);
  }
  function handleLeave() {
    setHovered(false);
    onHoverChange?.(false);
  }

  return (
    <div
      className={clsx(
        "relative cursor-pointer select-none rounded-xl border-2 transition-all duration-200",
        "card-3d-container group",
        w, h,
        selected && "card-selected",
        disabled && "cursor-not-allowed",
        !disabled && !selected && "hover:-translate-y-2",
        className,
      )}
      onClick={!disabled ? onClick : undefined}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        borderColor: disabled
          ? "#2E2E44"
          : (hovered || selected ? meta.color : meta.color + "88"),
        boxShadow: selected
          ? `0 0 24px ${meta.glowColor}, 0 0 48px ${meta.glowColor.replace("0.8","0.3")}`
          : disabled
          ? "none"
          : hovered
          ? `0 8px 24px rgba(0,0,0,0.6), 0 0 16px ${meta.glowColor}`
          : `0 4px 12px rgba(0,0,0,0.5), 0 0 6px ${meta.color}40`,
      }}
    >
      {faceDown ? (
        <CardBack small={small} />
      ) : (
        <CardFace card={card} meta={meta} theme={theme} small={small} />
      )}

      {/* Overlay gelap untuk kartu yang tidak bisa dimainkan — lebih jelas
          kontrasnya dibanding opacity, dan tidak bikin gambar/warna kartu
          jadi pudar tanpa makna (overlay solid lebih jelas "tidak bisa diklik"
          dibanding sekadar transparan). */}
      {disabled && (
        <div className="absolute inset-0 rounded-xl bg-black/65 pointer-events-none" />
      )}
    </div>
  );
}

function CardFace({
  card, meta, theme, small,
}: {
  card: Card;
  meta: typeof CARD_META[CardType];
  theme: ReturnType<typeof getCardTheme>;
  small: boolean;
}) {
  // Kalau ada gambar custom, tampilkan sebagai background image penuh dengan
  // nama kartu sebagai caption di bawah (gradient overlay supaya teks tetap
  // terbaca di atas gambar apapun). Kalau tidak ada gambar, fallback ke
  // tampilan emoji + gradient warna seperti desain asli.
  if (theme.image) {
    return (
      <div className="w-full h-full rounded-xl overflow-hidden relative">
        <Image
          src={theme.image}
          alt={theme.displayName}
          fill
          sizes={small ? "64px" : "96px"}
          className="object-cover"
          // Gambar custom yang di-upload user mungkin tidak selalu optimal
          // dimensinya — unoptimized supaya tidak gagal build kalau ukuran aneh.
          unoptimized
        />
        {/* Gradient overlay bawah supaya nama kartu tetap terbaca */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

        {!small && (
          <div
            className="absolute top-1.5 left-1.5 text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded font-display"
            style={{ background: meta.color + "55", color: "#fff" }}
          >
            {meta.category}
          </div>
        )}

        <div className="absolute bottom-1.5 inset-x-1.5 text-center">
          <p className="font-display text-white text-[10px] leading-tight tracking-wide uppercase drop-shadow-md">
            {theme.displayName}
          </p>
        </div>
      </div>
    );
  }

  // Fallback: emoji + gradient warna (desain original)
  return (
    <div
      className="w-full h-full rounded-xl flex flex-col items-center justify-between p-2 overflow-hidden relative"
      style={{ background: meta.bgGradient }}
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

      {!small && (
        <div
          className="self-start text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded font-display"
          style={{ background: meta.color + "33", color: meta.color }}
        >
          {meta.category}
        </div>
      )}

      <div className={clsx("text-center", small ? "text-3xl" : "text-4xl my-1")}>
        {card.emoji}
      </div>

      {!small && (
        <div className="text-center">
          <p className="font-display text-white text-[10px] leading-tight tracking-wide uppercase">
            {theme.displayName}
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
export function CardDeckStack({ count, onClick, highlight }: { count: number; onClick?: () => void; highlight?: boolean }) {
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
      <div
        className={clsx(
          "relative w-24 h-36 rounded-xl bg-card-gradient",
          "flex flex-col items-center justify-center gap-1",
          "transition-all duration-200",
          highlight
            ? "border-2 border-ember shadow-[0_0_20px_rgba(192,57,43,0.6)] animate-lava-pulse"
            : "border border-lava/40 group-hover:border-lava group-hover:shadow-lava-glow"
        )}
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
