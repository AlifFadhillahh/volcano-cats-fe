# 🌋 Volcano Cats — Frontend

Multiplayer card game frontend, dibangun dengan Next.js + Zustand + Colyseus.js.

## Tech Stack
- **Next.js 14** (App Router)
- **Zustand** — state management
- **Colyseus.js** — WebSocket client untuk konek ke game server
- **Tailwind CSS** — styling dengan custom design tokens
- **Vercel** — hosting

## Setup Local

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local, isi NEXT_PUBLIC_SERVER_URL dengan URL backend kamu

npm run dev
```

Buka `http://localhost:3000`

> ⚠️ **Penting**: backend (Colyseus server) harus jalan duluan di `localhost:3001` sebelum frontend bisa connect. Lihat folder `volcano-cats-backend`.

## Deploy ke Vercel

1. Push repo ke GitHub
2. Import project di [vercel.com/new](https://vercel.com/new)
3. Set environment variable:
   - `NEXT_PUBLIC_SERVER_URL` = `wss://<your-railway-app>.up.railway.app`
   
   ⚠️ Gunakan `wss://` (bukan `https://`) karena ini WebSocket connection, dan pastikan backend Railway sudah deploy duluan.
4. Deploy!

## Struktur Project

```
app/
├── page.tsx                  # Home — input username, buat/join room
├── room/[id]/page.tsx        # Halaman utama game (orchestrator)
└── globals.css                # Font, animasi custom, scrollbar

components/
├── game/
│   ├── Lobby.tsx              # Waiting room sebelum game mulai
│   ├── GameTable.tsx          # Layout meja: avatar pemain, deck, discard
│   ├── PlayerHand.tsx         # Kartu di tangan + gang detection
│   ├── GameCard.tsx           # Komponen kartu individual + deck stack
│   ├── PlayerAvatar.tsx       # Avatar pemain dengan turn indicator
│   ├── GameOver.tsx           # Layar kemenangan/kekalahan
│   ├── GameLog.tsx            # Sidebar log aktivitas
│   ├── WaterBucketModal.tsx   # Pilih posisi taruh Lava Cat
│   ├── PeekModal.tsx          # Spy Cat / Peek & Swap result
│   ├── BribeModal.tsx         # Kasih kartu saat kena Bribe
│   ├── FloodModal.tsx         # Flood discard + Time Warp pick
│   ├── GangPlayerPicker.tsx   # Pilih target untuk gang combo
│   ├── FreezeButton.tsx       # Tombol interrupt Freeze
│   └── TargetingBanner.tsx    # Banner saat memilih target kartu
├── ui/
│   └── NotificationToasts.tsx # Toast notifikasi (error, death, dll)
└── animations/
    └── EmberParticles.tsx     # Partikel ember melayang di background

lib/
└── useColyseusRoom.ts         # Hook untuk koneksi WebSocket ke Colyseus

store/
└── gameStore.ts                # Zustand store (single source of truth UI)

types/
└── game.ts                     # Types + metadata visual tiap kartu
```

## Design System

| Token | Value | Penggunaan |
|---|---|---|
| `obsidian` | `#0D0D0F` | Background utama |
| `lava` | `#FF5C1A` | Aksi primer, bahaya |
| `gold` | `#FFB547` | Aksi sekunder, kemenangan |
| `ember` | `#C0392B` | Error, kematian |
| `cream` | `#F0EAD6` | Teks utama |
| Font display | `Righteous` | Judul, label kartu |
| Font body | `Inter` | UI, deskripsi |

## Alur Game (UI)

```
Home (username + room code)
  │
  ▼
Lobby (menunggu pemain, host start)
  │
  ▼
Playing
  ├─ GameTable (avatar melingkar + deck + discard)
  ├─ PlayerHand (kartu sendiri di bawah)
  ├─ Modal kontekstual (Water Bucket / Bribe / Flood / dll)
  └─ Notifikasi real-time (toast + log sidebar)
  │
  ▼
GameOver (hasil akhir + kembali ke menu)
```

## Catatan Implementasi

- **State sinkron 100% dari server.** Frontend tidak punya game logic sendiri — semua validasi di Colyseus backend. Frontend cuma kirim "intent" dan render state yang dikembalikan.
- **Hand kartu pemain lain tidak pernah diterima** dari server (hanya `handCount`), jadi tidak mungkin di-cheat lewat devtools.
- **Reconnect**: kalau browser refresh/disconnect saat game berjalan, server kasih waktu 60 detik untuk reconnect dengan username yang sama sebelum dianggap kalah.
