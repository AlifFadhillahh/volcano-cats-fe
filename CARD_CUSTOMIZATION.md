# 🎨 Kustomisasi Tampilan Kartu

Semua tampilan kartu (nama, deskripsi, gambar) diatur di **satu file**:

```
lib/cardTheme.ts
```

## Ganti Nama / Deskripsi Kartu

Buka `lib/cardTheme.ts`, cari entry kartu yang mau diubah (key-nya pakai `CardType` asli, contoh `LAVA_CAT`), lalu edit `displayName` dan/atau `displayDescription`:

```ts
LAVA_CAT: {
  displayName: "Naga Api",              // <- ganti ini
  displayDescription: "Bahaya banget!", // <- atau ini
},
```

**Efek kartu TIDAK berubah** — itu murni ditentukan oleh `CardType` (`LAVA_CAT`) dan logic-nya hidup di backend (`engine.ts`), terpisah total dari file tema ini. Kamu bisa ganti nama jadi apapun, kartu tetap "meledak" sesuai mekanik aslinya.

## Ganti Gambar Kartu

1. Siapkan gambar (disarankan rasio potret ~3:4, misal 300×400px, format PNG/WebP)
2. Taruh di folder `public/cards/`, contoh: `public/cards/lava-cat.png`
3. Di `lib/cardTheme.ts`, isi field `image`:

```ts
LAVA_CAT: {
  displayName: "Lava Cat",
  displayDescription: "...",
  image: "/cards/lava-cat.png",  // <- tambahkan ini
},
```

4. Selesai — kartu otomatis tampil pakai gambar itu, dengan nama di bawahnya (overlay gradient supaya tetap terbaca di atas gambar apapun).

## Tidak Punya Gambar untuk Semua Kartu?

Tidak masalah — kartu yang **tidak** diisi field `image` otomatis fallback ke tampilan emoji + warna gradient (desain default). Kamu bisa kustomisasi sebagian kartu dulu, sisanya tetap pakai tampilan default, campur aduk juga tidak masalah.

## Struktur Folder Gambar

```
public/cards/
├── lava-cat.png
├── water-bucket.png
├── nap-time.png
├── ...
```

Path di `cardTheme.ts` harus diawali `/cards/` (sesuai lokasi folder di atas), bukan `public/cards/` — Next.js otomatis serve semua isi `public/` dari root URL.
