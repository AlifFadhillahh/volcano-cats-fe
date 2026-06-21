"use client";
import { useEffect, useState, useRef } from "react";
import { Card, CARD_META, CardType } from "@/types/game";
import { getCardTheme } from "@/lib/cardTheme";
import clsx from "clsx";

interface CardPlayAnimationProps {
  // Kartu teratas discard pile — animasi ter-trigger setiap kali ID kartu ini berubah
  lastDiscardedCard: Card | null;
  // Nama pemain yang memainkan kartu (untuk caption)
  playerName?: string;
}

interface AnimationState {
  card: Card;
  key: number; // increment tiap trigger baru, dipakai sebagai React key untuk restart animasi
  playerName?: string;
}

type CardMetaCategory = "danger" | "action" | "new" | "gang";

// Efek visual berbeda per kategori kartu — supaya kartu bahaya terasa beda
// dari kartu aksi biasa, dan gang card punya nuansa warna sesuai gang-nya.
function getEffectClass(category: CardMetaCategory): string {
  switch (category) {
    case "danger":
      return "animate-lava-pulse";
    case "gang":
      return "animate-glow-pulse";
    default:
      return "";
  }
}

export function CardPlayAnimation({ lastDiscardedCard, playerName }: CardPlayAnimationProps) {
  const [anim, setAnim] = useState<AnimationState | null>(null);
  const lastCardIdRef = useRef<string | null>(null);
  const keyCounterRef = useRef(0);

  useEffect(() => {
    if (!lastDiscardedCard) return;
    if (lastDiscardedCard.id === lastCardIdRef.current) return; // kartu sama, jangan re-trigger

    lastCardIdRef.current = lastDiscardedCard.id;
    keyCounterRef.current += 1;
    setAnim({ card: lastDiscardedCard, key: keyCounterRef.current, playerName });

    const timeout = setTimeout(() => setAnim(null), 1400);
    return () => clearTimeout(timeout);
  }, [lastDiscardedCard, playerName]);

  if (!anim) return null;

  const meta = CARD_META[anim.card.type as CardType];
  const theme = getCardTheme(anim.card.type as CardType);

  return (
    <div
      key={anim.key}
      className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
    >
      {/* Dim backdrop singkat */}
      <div className="absolute inset-0 bg-black/30 animate-[fadeOut_1.4s_ease-out_forwards]" />

      <div className="relative flex flex-col items-center gap-3 animate-[cardPlayPop_1.4s_ease-out_forwards]">
        <div
          className={clsx(
            "w-32 h-48 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 shadow-2xl",
            getEffectClass(meta.category)
          )}
          style={{ background: meta.bgGradient, borderColor: meta.color }}
        >
          <span className="text-5xl">{anim.card.emoji}</span>
          <span className="font-display text-white text-sm tracking-wide text-center px-2">
            {theme.displayName}
          </span>
        </div>
        {anim.playerName && (
          <p className="font-display text-cream text-sm bg-obsidian-3/90 px-3 py-1 rounded-full border border-card-border">
            {anim.playerName}
          </p>
        )}
      </div>
    </div>
  );
}
