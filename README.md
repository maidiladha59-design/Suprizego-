# SuprizeGo

Aplikasi Next.js untuk membuat halaman kejutan personal dengan reader bersama, foto, voice note, musik bawaan, Main Berdua, tema Hari Spesial, dan pembayaran Midtrans Snap.

## Teknologi

- Next.js App Router + React + TypeScript strict
- Tailwind CSS v4
- Supabase Database, Storage privat, dan service role khusus server
- Midtrans Snap sandbox/produksi
- `qrcode` untuk kartu QR server-side

## Menjalankan secara lokal

Prasyarat: Node.js 20 atau lebih baru dan npm. Proyek ini diverifikasi dengan Node.js 24.

```bash
npm install
cp .env.example .env.local
```

Isi `.env.local`:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
NEXT_PUBLIC_CONTACT_EMAIL=

MIDTRANS_SERVER_KEY=
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false
```

Service role Supabase dan server key Midtrans hanya boleh dipakai server. Jangan menambahkan prefix `NEXT_PUBLIC_` pada kedua rahasia tersebut.

Terapkan migrasi Supabase secara berurutan melalui SQL Editor:

1. `supabase/migrations/0001_surprise_pages.sql`
2. `supabase/migrations/0002_special_day.sql`
3. `supabase/migrations/0003_midtrans_pages_orders.sql`

Migrasi `0001` membuat bucket privat `surprise-media`. Migrasi `0003` membuat tabel aktif `pages` dan `orders`, RLS, serta RPC aktivasi/kegagalan order.

Jalankan aplikasi:

```bash
npm run dev
```

Buka `http://127.0.0.1:3000`. Tanpa variabel Supabase/Midtrans yang lengkap, editor dan contoh tetap dapat dipreview, tetapi checkout mengembalikan status belum terkonfigurasi.

## Perintah verifikasi

```bash
npm run typecheck
npm run lint
npm run build
npm run start
```

Untuk produksi, jalankan build sebelum `npm run start`. Jangan memakai `next dev` sebagai server produksi.

## Midtrans

Ikuti [dokumentasi Midtrans](docs/MIDTRANS.md) untuk:

- konfigurasi sandbox dan production keys;
- notification URL `https://suprizego.vercel.app/api/midtrans/notification`;
- alur checkout dan webhook;
- pengujian sandbox;
- diagnosis error;
- checklist produksi.

Harga Dasar Rp5.000, Plus Rp10.000, dan Abadi Rp15.000 bersumber dari `lib/pricing.ts` dan divalidasi ulang di server. Client tidak dapat menentukan harga.

## Struktur penting

- `app/buat/[moment]` — editor dan preview.
- `app/p/[slug]` — halaman penerima yang hanya aktif setelah pembayaran terverifikasi.
- `app/selesai` — status pembayaran, salin tautan, WhatsApp, dan QR.
- `app/api/checkout` — validasi draf/berkas, persistensi, dan pembuatan Snap token.
- `app/api/midtrans/notification` — verifikasi signature dan aktivasi idempoten.
- `components/surprise` — reader bersama, demo, game, musik, voice, dan kartu unduhan.
- `lib/special-days.ts` — definisi 17 Hari Spesial dan musim H−21 sampai H+3.
- `docs/feature-audit.md` — status jujur fitur paket dan batasannya.
- `docs/CHANGELOG.md` — keputusan dan hasil setiap tahap implementasi.

## Deploy ke Vercel

1. Hubungkan repository proyek ke Vercel.
2. Isi Environment Variables untuk Production dan Preview sesuai `.env.example`.
3. Gunakan Supabase project yang sama dengan migrasi yang sudah diterapkan.
4. Untuk sandbox, gunakan kunci sandbox dan `MIDTRANS_IS_PRODUCTION=false`.
5. Set notification URL Midtrans ke `https://suprizego.vercel.app/api/midtrans/notification`.
6. Deploy, lalu uji checkout dan webhook dengan transaksi sandbox nyata.
7. Setelah sandbox lulus, ganti kunci produksi dan set `MIDTRANS_IS_PRODUCTION=true`.

`NEXT_PUBLIC_SITE_URL` harus mengarah ke origin publik tanpa path. Environment variables publik dibangun saat deploy, jadi deploy ulang setelah mengubah nilainya.

## Keamanan dan batasan

- `.env*` diabaikan Git kecuali `.env.example`.
- Tabel database memakai RLS tanpa policy publik; akses aplikasi memakai service role di server.
- Foto dan voice note disimpan privat serta diberikan signed URL satu jam hanya pada halaman aktif.
- Aktivasi hanya dilakukan lewat webhook Midtrans yang signature, nominal, currency, order, dan paketnya terverifikasi.
- Halaman hasil dan halaman penerima bersifat `noindex`.
- Main Berdua masih berjalan lokal; hasil permainan belum dikirim ke pengirim.
- Tautan Spotify divalidasi dan disimpan, tetapi pemutaran/embed masih berstatus **Segera hadir**.
- Kapsul waktu, ucapan bareng, link custom, Papan Abadi, desain eksklusif, dan edit terautentikasi setelah pembayaran belum tersedia.
