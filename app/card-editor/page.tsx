"use client";
import Image from "next/image";
import { useState } from "react";
import { CARD_THEME, CardThemeEntry } from "@/lib/cardTheme";
import { CARD_META, CardType } from "@/types/game";
import clsx from "clsx";

// ============================================================
// CARD EDITOR — halaman preview untuk kustomisasi kartu
// Buka di: http://localhost:3000/card-editor (dev mode saja)
// ============================================================

const ALL_CARD_TYPES = Object.keys(CARD_THEME) as CardType[];

// Nama file yang diharapkan per CardType (konvensi naming)
function expectedFilename(type: CardType): string {
  return type.toLowerCase().replace(/_/g, "-") + ".webp";
}

function CardPreview({ type, theme }: { type: CardType; theme: CardThemeEntry }) {
  const meta = CARD_META[type];
  const [imgOk, setImgOk] = useState<boolean | null>(null); // null = belum dicoba, true = ok, false = error

  const hasImage = Boolean(theme.image);
  const isLoaded = imgOk === true;
  const isMissing = !hasImage || imgOk === false;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Card */}
      <div
        className={clsx(
          "relative w-28 h-44 rounded-xl overflow-hidden border-2 flex flex-col items-center justify-between p-2",
          isMissing ? "border-dashed border-ash/30" : "border-solid",
        )}
        style={{
          background: meta.bgGradient,
          borderColor: isMissing ? undefined : meta.color,
          boxShadow: isLoaded ? `0 0 12px ${meta.color}44` : "none",
        }}
      >
        {/* Image */}
        {theme.image && (
          <Image
            src={theme.image}
            alt={theme.displayName}
            fill
            sizes="112px"
            className="object-cover"
            unoptimized
            onLoad={() => setImgOk(true)}
            onError={() => setImgOk(false)}
          />
        )}

        {/* Overlay supaya nama tetap terbaca di atas gambar */}
        {isLoaded && (
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
        )}

        {/* Fallback content (kalau tidak ada gambar) */}
        {!isLoaded && (
          <>
            <div
              className="self-start text-[8px] uppercase tracking-widest px-1 py-0.5 rounded font-mono relative z-10"
              style={{ background: meta.color + "33", color: meta.color }}
            >
              {meta.category}
            </div>
            <div className="text-4xl relative z-10">
              {/* emoji dari game state — pakai fallback per type */}
              {EMOJI_MAP[type] ?? "🃏"}
            </div>
          </>
        )}

        {/* Nama kartu di bawah */}
        <p className="relative z-10 text-center font-mono text-white text-[9px] leading-tight uppercase tracking-wide w-full">
          {theme.displayName}
        </p>

        {/* Status badge */}
        <div className={clsx(
          "absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] z-20",
          isLoaded ? "bg-green-500" : hasImage && imgOk === null ? "bg-yellow-500" : "bg-ash/30"
        )}>
          {isLoaded ? "✓" : hasImage && imgOk === null ? "…" : ""}
        </div>
      </div>

      {/* Info di bawah kartu */}
      <div className="text-center w-28">
        <p className="text-[10px] font-mono text-cream truncate">{theme.displayName}</p>
        <p className="text-[9px] font-mono text-ash mt-0.5">
          {isLoaded
            ? <span className="text-green-400">✓ {theme.image?.split("/").pop()}</span>
            : hasImage
            ? imgOk === null
              ? <span className="text-yellow-400">loading…</span>
              : <span className="text-red-400">✗ file tidak ditemukan</span>
            : <span className="text-ash/50">{expectedFilename(type)}</span>
          }
        </p>
      </div>
    </div>
  );
}

// Emoji default per type (fallback kalau gambar belum ada)
const EMOJI_MAP: Partial<Record<CardType, string>> = {
  LAVA_CAT: "🌋", WATER_BUCKET: "💧", NAP_TIME: "😴", ERUPTION: "🌀",
  SPY_CAT: "🔭", EARTHQUAKE: "🔀", FREEZE: "❄️", BRIBE: "🎁",
  REVERSE: "🔄", SNIPER: "🎯", PEEK_AND_SWAP: "👁️", BUNKER: "🛡️",
  PICKPOCKET: "💸", FLOOD: "🌊", TIME_WARP: "🪄", LOCKDOWN: "🔒",
  GANG_FIRE: "🔥", GANG_ICE: "🧊", GANG_STORM: "⚡", GANG_EARTH: "🌿", GANG_SHADOW: "🌑",
};

const CATEGORY_LABELS: Record<string, string> = {
  danger: "⚠️ Bahaya",
  action: "⚡ Aksi Klasik",
  new: "✨ Mekanik Baru",
  gang: "👥 Gang Cards",
};

export default function CardEditorPage() {
  const grouped: Record<string, CardType[]> = {};
  for (const type of ALL_CARD_TYPES) {
    const cat = CARD_META[type].category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(type);
  }

  const total = ALL_CARD_TYPES.length;
  const withImage = ALL_CARD_TYPES.filter(t => Boolean(CARD_THEME[t].image)).length;

  return (
    <div className="min-h-screen bg-obsidian text-cream p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-lava mb-1">🃏 Card Editor Preview</h1>
        <p className="text-ash text-sm">
          Preview semua kartu · {withImage}/{total} sudah ada gambar
        </p>
        <div className="w-64 h-1.5 bg-obsidian-3 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-lava rounded-full transition-all"
            style={{ width: `${(withImage / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Quick guide */}
      <div className="bg-obsidian-3 border border-card-border rounded-xl p-4 mb-8 max-w-2xl">
        <h2 className="font-display text-gold text-sm mb-2">🚀 Cara cepat custom kartu</h2>
        <ol className="text-ash text-xs space-y-1 list-decimal list-inside">
          <li>Drop gambar ke folder <code className="bg-black/30 px-1 rounded text-cream">public/cards/</code></li>
          <li>Buka <code className="bg-black/30 px-1 rounded text-cream">lib/cardTheme.ts</code> di VSCode</li>
          <li>Hapus <code className="bg-black/30 px-1 rounded text-cream">// </code> di depan baris <code className="bg-black/30 px-1 rounded text-cream">image:</code> untuk kartu yang bersangkutan</li>
          <li>Refresh halaman ini — cek tanda <span className="text-green-400">✓ hijau</span> muncul di pojok kartu</li>
        </ol>
        <p className="text-ash/60 text-xs mt-2">
          Format disarankan: <strong className="text-cream">WebP</strong> (ringan) atau JPG · Ukuran ideal: 400×600 px (rasio 2:3)
        </p>
      </div>

      {/* Cards by category */}
      {Object.entries(grouped).map(([cat, types]) => (
        <div key={cat} className="mb-10">
          <h2 className="font-display text-lg text-ash-light mb-4 pb-1 border-b border-card-border">
            {CATEGORY_LABELS[cat] ?? cat}
          </h2>
          <div className="flex flex-wrap gap-4">
            {types.map(type => (
              <CardPreview key={type} type={type} theme={CARD_THEME[type]} />
            ))}
          </div>
        </div>
      ))}

      {/* File naming reference */}
      <div className="mt-8 bg-obsidian-3 border border-card-border rounded-xl p-4 max-w-2xl">
        <h2 className="font-display text-gold text-sm mb-3">📁 Nama file yang diharapkan</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-0.5">
          {ALL_CARD_TYPES.map(type => (
            <div key={type} className="flex justify-between items-center py-0.5 border-b border-card-border/30 text-xs">
              <span className="font-mono text-ash">{type}</span>
              <span className={clsx(
                "font-mono",
                CARD_THEME[type].image ? "text-green-400" : "text-ash/40"
              )}>
                {expectedFilename(type)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* cardTheme.ts snippet */}
      <div className="mt-6 bg-obsidian-3 border border-card-border rounded-xl p-4 max-w-2xl">
        <h2 className="font-display text-gold text-sm mb-3">📝 Cara edit lib/cardTheme.ts</h2>
        <pre className="text-xs text-ash leading-relaxed overflow-x-auto">
{`// Sebelum (belum ada gambar):
LAVA_CAT: {
  displayName: "Lava Cat",
  displayDescription: "Jika kamu draw ini...",
  // image: "/cards/lava-cat.webp",  ← ada tanda // = dikomentari
},

// Sesudah (gambar aktif):
LAVA_CAT: {
  displayName: "Lava Cat",
  displayDescription: "Jika kamu draw ini...",
  image: "/cards/lava-cat.webp",     ← hapus // di depannya
},

// Ganti nama kartu:
LAVA_CAT: {
  displayName: "Naga Api",           ← ganti teks ini
  displayDescription: "Nama baru, efek tetap sama!",
  image: "/cards/lava-cat.webp",
},`}
        </pre>
      </div>

      <p className="text-ash/40 text-xs mt-8 text-center">
        Halaman ini cuma tampil di dev mode · Tidak masuk ke production build
      </p>
    </div>
  );
}
