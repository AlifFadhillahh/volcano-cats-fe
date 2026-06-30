import { CardType } from "@/types/game";

// ============================================================
// CARD THEME — kustomisasi tampilan kartu
// ============================================================
//
// CARA CEPAT CUSTOM KARTU:
//
//   1. Buka folder  public/cards/  di VSCode
//   2. Drop gambar kamu ke sana (JPG atau WebP, ukuran bebas)
//   3. Isi field `image` di bawah dengan nama file-nya
//   4. Refresh browser — selesai
//
// PENAMAAN FILE YANG DISARANKAN (supaya gampang diingat):
//   Ikuti nama key di sini, semua huruf kecil dengan tanda hubung:
//   LAVA_CAT      → public/cards/lava-cat.webp
//   WATER_BUCKET  → public/cards/water-bucket.webp
//   NAP_TIME      → public/cards/nap-time.webp
//   GANG_FIRE     → public/cards/gang-fire.webp
//   ... dst
//
// FORMAT FILE:
//   - WebP      → terbaik, file paling ringan (30-60 KB per kartu)
//   - JPG/JPEG  → oke juga, sedikit lebih besar tapi tidak masalah
//   - PNG       → hindari untuk foto/ilustrasi (file besar), oke untuk
//                 artwork pixelated atau dengan background transparan
//
// UKURAN GAMBAR:
//   - Rasio ideal: 2:3 potret (contoh: 400×600, 600×900, 800×1200 px)
//   - Kartu akan di-crop center kalau rasionya tidak pas — jadi pastikan
//     elemen utama ada di tengah gambar
//   - Tidak perlu resize manual — Next.js optimasi otomatis saat build
//
// GANTI NAMA / DESKRIPSI:
//   Edit `displayName` dan `displayDescription` — hanya tampilan,
//   tidak mempengaruhi cara kartu bekerja sama sekali.
//
// PREVIEW SEMUA KARTU:
//   Saat `npm run dev`, buka  http://localhost:3000/card-editor
//   untuk melihat semua kartu sekaligus dan cek gambar sudah terpasang.
// ============================================================

export interface CardThemeEntry {
  displayName: string;
  displayDescription: string;
  // Path gambar relatif dari /public.
  // Contoh: "/cards/lava-cat.webp" atau "/cards/lava-cat.jpg"
  // Kosongkan (hapus baris ini atau biarkan undefined) untuk pakai
  // tampilan emoji + gradient warna sebagai fallback.
  image?: string;
}

export const CARD_THEME: Record<CardType, CardThemeEntry> = {
  // ── BAHAYA ──────────────────────────────────────────────────
  LAVA_CAT: {
    displayName: "Lava Cat",
    displayDescription: "Jika kamu draw ini tanpa Water Bucket, kamu MATI!",
    // image: "/cards/lava-cat.webp",
  },
  WATER_BUCKET: {
    displayName: "Water Bucket",
    displayDescription: "Selamatkan diri dari Lava Cat. Taruh balik Lava Cat di posisi manapun dalam deck.",
    // image: "/cards/water-bucket.webp",
  },

  // ── AKSI KLASIK ─────────────────────────────────────────────
  NAP_TIME: {
    displayName: "Nap Time",
    displayDescription: "Skip giliran tanpa draw kartu.",
    // image: "/cards/nap-time.webp",
  },
  ERUPTION: {
    displayName: "Eruption",
    displayDescription: "Skip giliranmu. Pemain berikutnya kena 2 turn berturut-turut.",
    // image: "/cards/eruption.webp",
  },
  SPY_CAT: {
    displayName: "Spy Cat",
    displayDescription: "Lihat 3 kartu teratas deck secara rahasia.",
    // image: "/cards/spy-cat.webp",
  },
  EARTHQUAKE: {
    displayName: "Earthquake",
    displayDescription: "Acak ulang seluruh deck.",
    // image: "/cards/earthquake.webp",
  },
  FREEZE: {
    displayName: "Freeze",
    displayDescription: "Batalkan aksi siapapun selama window berlangsung. Bisa di-Freeze balik!",
    // image: "/cards/freeze.webp",
  },
  BRIBE: {
    displayName: "Bribe",
    displayDescription: "Paksa 1 pemain kasih 1 kartu ke kamu. Mereka pilih kartunya.",
    // image: "/cards/bribe.webp",
  },

  // ── MEKANIK BARU ─────────────────────────────────────────────
  REVERSE: {
    displayName: "Reverse",
    displayDescription: "Balik arah urutan giliran.",
    // image: "/cards/reverse.webp",
  },
  SNIPER: {
    displayName: "Sniper",
    displayDescription: "Pilih 1 pemain — mereka harus draw 1 kartu sekarang, di luar giliran mereka.",
    // image: "/cards/sniper.webp",
  },
  PEEK_AND_SWAP: {
    displayName: "Peek & Swap",
    displayDescription: "Lihat 1 kartu teratas deck, lalu boleh swap dengan 1 kartu dari tanganmu.",
    // image: "/cards/peek-and-swap.webp",
  },
  BUNKER: {
    displayName: "Bunker",
    displayDescription: "Melindungi dari Lava Cat SAJA — jika draw Lava Cat, Bunker hancur dan Lava Cat kembali ke deck acak. Tidak melindungi dari Sniper, Pickpocket, Flood, dll.",
    // image: "/cards/bunker.webp",
  },
  PICKPOCKET: {
    displayName: "Pickpocket",
    displayDescription: "Ambil 1 kartu ACAK dari tangan pemain pilihanmu.",
    // image: "/cards/pickpocket.webp",
  },
  FLOOD: {
    displayName: "Flood",
    displayDescription: "Semua pemain buang 1 kartu pilihan mereka ke discard pile.",
    // image: "/cards/flood.webp",
  },
  TIME_WARP: {
    displayName: "Time Warp",
    displayDescription: "Ambil 1 kartu apapun dari discard pile ke tanganmu.",
    // image: "/cards/time-warp.webp",
  },
  LOCKDOWN: {
    displayName: "Lockdown",
    displayDescription: "Pilih 1 pemain — giliran berikutnya mereka tidak bisa main kartu apapun.",
    // image: "/cards/lockdown.webp",
  },

  // ── GANG CARDS ───────────────────────────────────────────────
  // Pair=steal random  Triple=steal random dari target
  // Quad=steal dari semua  Rainbow(5 jenis)=swap tangan
  GANG_FIRE: {
    displayName: "Fire Gang",
    displayDescription: "Gang card. Kumpulkan 2-4 kartu sama atau 5 berbeda untuk efek steal!",
    // image: "/cards/gang-fire.webp",
  },
  GANG_ICE: {
    displayName: "Ice Gang",
    displayDescription: "Gang card. Kumpulkan 2-4 kartu sama atau 5 berbeda untuk efek steal!",
    // image: "/cards/gang-ice.webp",
  },
  GANG_STORM: {
    displayName: "Storm Gang",
    displayDescription: "Gang card. Kumpulkan 2-4 kartu sama atau 5 berbeda untuk efek steal!",
    // image: "/cards/gang-storm.webp",
  },
  GANG_EARTH: {
    displayName: "Earth Gang",
    displayDescription: "Gang card. Kumpulkan 2-4 kartu sama atau 5 berbeda untuk efek steal!",
    // image: "/cards/gang-earth.webp",
  },
  GANG_SHADOW: {
    displayName: "Shadow Gang",
    displayDescription: "Gang card. Kumpulkan 2-4 kartu sama atau 5 berbeda untuk efek steal!",
    // image: "/cards/gang-shadow.webp",
  },
};

export function getCardTheme(type: CardType): CardThemeEntry {
  return CARD_THEME[type] ?? { displayName: type, displayDescription: "" };
}

// ============================================================
// Nama file gambar yang diharapkan per kartu (referensi cepat)
// ============================================================
// Bisa kamu copy-paste ke terminal untuk buat placeholder files:
//
// CARD                   FILENAME (taruh di public/cards/)
// LAVA_CAT            →  lava-cat.webp
// WATER_BUCKET        →  water-bucket.webp
// NAP_TIME            →  nap-time.webp
// ERUPTION            →  eruption.webp
// SPY_CAT             →  spy-cat.webp
// EARTHQUAKE          →  earthquake.webp
// FREEZE              →  freeze.webp
// BRIBE               →  bribe.webp
// REVERSE             →  reverse.webp
// SNIPER              →  sniper.webp
// PEEK_AND_SWAP       →  peek-and-swap.webp
// BUNKER              →  bunker.webp
// PICKPOCKET          →  pickpocket.webp
// FLOOD               →  flood.webp
// TIME_WARP           →  time-warp.webp
// LOCKDOWN            →  lockdown.webp
// GANG_FIRE           →  gang-fire.webp
// GANG_ICE            →  gang-ice.webp
// GANG_STORM          →  gang-storm.webp
// GANG_EARTH          →  gang-earth.webp
// GANG_SHADOW         →  gang-shadow.webp

