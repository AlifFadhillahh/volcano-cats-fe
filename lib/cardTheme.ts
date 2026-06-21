import { CardType } from "@/types/game";

// ============================================================
// CARD THEME — kustomisasi tampilan kartu
// ============================================================
// File ini adalah SATU-SATUNYA tempat yang perlu diubah untuk mengganti
// nama, deskripsi, atau gambar kartu. Efek/mekanik kartu TIDAK terpengaruh
// sama sekali oleh perubahan di sini — itu murni ditentukan oleh `CardType`
// dan logic-nya hidup di backend (src/game/engine.ts), terpisah total dari file ini.
//
// CARA GANTI GAMBAR KARTU:
// 1. Taruh file gambar di folder /public/cards/ (contoh: /public/cards/lava-cat.png)
// 2. Isi field `image` di bawah dengan path itu, contoh: "/cards/lava-cat.png"
// 3. Kosongkan / hapus field `image` (atau set undefined) untuk fallback ke
//    tampilan emoji + gradient warna seperti sekarang — tidak perlu gambar
//    untuk semua kartu sekaligus, bisa custom sebagian dulu.
//
// CARA GANTI NAMA / DESKRIPSI:
// Cukup edit field `displayName` dan `displayDescription` di bawah.
// Field ini HANYA untuk tampilan — tidak mempengaruhi cara kartu bekerja.
//
// Catatan ukuran gambar yang disarankan: rasio potret ~3:4 (mis. 300x400px),
// format PNG/WebP dengan background transparan atau penuh (akan di-crop
// otomatis dengan object-fit: cover mengikuti bentuk kartu).
// ============================================================

export interface CardThemeEntry {
  displayName: string;
  displayDescription: string;
  image?: string; // path relatif dari /public, contoh: "/cards/lava-cat.png". Kosongkan untuk pakai emoji fallback.
}

export const CARD_THEME: Record<CardType, CardThemeEntry> = {
  LAVA_CAT: {
    displayName: "Lava Cat",
    displayDescription: "Jika kamu draw ini tanpa Water Bucket, kamu MATI!",
  },
  WATER_BUCKET: {
    displayName: "Water Bucket",
    displayDescription: "Selamatkan diri dari Lava Cat. Taruh balik Lava Cat di posisi manapun dalam deck.",
  },
  NAP_TIME: {
    displayName: "Nap Time",
    displayDescription: "Skip giliran tanpa draw kartu.",
  },
  ERUPTION: {
    displayName: "Eruption",
    displayDescription: "Skip giliranmu. Pemain berikutnya kena 2 turn berturut-turut.",
  },
  SPY_CAT: {
    displayName: "Spy Cat",
    displayDescription: "Lihat 3 kartu teratas deck secara rahasia.",
  },
  EARTHQUAKE: {
    displayName: "Earthquake",
    displayDescription: "Acak ulang seluruh deck.",
  },
  FREEZE: {
    displayName: "Freeze",
    displayDescription: "Batalkan aksi siapapun selama window berlangsung. Bisa di-Freeze balik!",
  },
  BRIBE: {
    displayName: "Bribe",
    displayDescription: "Paksa 1 pemain kasih 1 kartu ke kamu. Mereka pilih kartunya.",
  },
  REVERSE: {
    displayName: "Reverse",
    displayDescription: "Balik arah urutan giliran.",
  },
  SNIPER: {
    displayName: "Sniper",
    displayDescription: "Pilih 1 pemain — mereka harus draw 1 kartu sekarang, di luar giliran mereka.",
  },
  PEEK_AND_SWAP: {
    displayName: "Peek & Swap",
    displayDescription: "Lihat 1 kartu teratas deck, lalu boleh swap dengan 1 kartu dari tanganmu.",
  },
  BUNKER: {
    displayName: "Bunker",
    displayDescription: "Pasang di depanmu. Batalkan efek negatif pertama yang kamu terima, lalu Bunker hancur.",
  },
  PICKPOCKET: {
    displayName: "Pickpocket",
    displayDescription: "Ambil 1 kartu ACAK dari tangan pemain pilihanmu.",
  },
  FLOOD: {
    displayName: "Flood",
    displayDescription: "Semua pemain buang 1 kartu pilihan mereka ke discard pile.",
  },
  TIME_WARP: {
    displayName: "Time Warp",
    displayDescription: "Ambil 1 kartu apapun dari discard pile ke tanganmu.",
  },
  LOCKDOWN: {
    displayName: "Lockdown",
    displayDescription: "Pilih 1 pemain — giliran berikutnya mereka tidak bisa main kartu apapun.",
  },
  GANG_FIRE: {
    displayName: "Fire Gang",
    displayDescription: "Gang card. Kombinasikan dengan kartu sejenis untuk efek steal.",
  },
  GANG_ICE: {
    displayName: "Ice Gang",
    displayDescription: "Gang card. Kombinasikan dengan kartu sejenis untuk efek steal.",
  },
  GANG_STORM: {
    displayName: "Storm Gang",
    displayDescription: "Gang card. Kombinasikan dengan kartu sejenis untuk efek steal.",
  },
  GANG_EARTH: {
    displayName: "Earth Gang",
    displayDescription: "Gang card. Kombinasikan dengan kartu sejenis untuk efek steal.",
  },
  GANG_SHADOW: {
    displayName: "Shadow Gang",
    displayDescription: "Gang card. Kombinasikan dengan kartu sejenis untuk efek steal.",
  },
};

export function getCardTheme(type: CardType): CardThemeEntry {
  return CARD_THEME[type] ?? { displayName: type, displayDescription: "" };
}
