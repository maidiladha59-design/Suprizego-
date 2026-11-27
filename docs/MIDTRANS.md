# Integrasi Midtrans Snap SuprizeGo

Dokumen ini menjelaskan konfigurasi sandbox, alur pembayaran, webhook, dan checklist produksi. Harga selalu dihitung di server dari `lib/pricing.ts`; payload client tidak boleh dipakai sebagai sumber harga.

## 1. Variabel lingkungan

Salin `.env.example` menjadi `.env.local`, lalu isi nilai berikut:

```env
SUPABASE_URL=https://project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=isi-service-role-key
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000

MIDTRANS_SERVER_KEY=SB-Mid-server-isi-kunci-sandbox
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-isi-kunci-sandbox
MIDTRANS_IS_PRODUCTION=false

NEXT_PUBLIC_CONTACT_EMAIL=email-bantuan@domain-anda
```

- `MIDTRANS_SERVER_KEY` dan `SUPABASE_SERVICE_ROLE_KEY` hanya dibaca modul server dan tidak boleh diberi prefix `NEXT_PUBLIC_`.
- Client key Midtrans memang publik karena dibutuhkan Snap di browser.
- Gunakan `NEXT_PUBLIC_SITE_URL` yang dapat diakses Midtrans. Untuk deployment, gunakan `https://suprizego.vercel.app`.
- `.env*` diabaikan Git kecuali `.env.example`. Jangan menuliskan kunci nyata di dokumentasi, source code, screenshot, atau commit.

## 2. Menyiapkan Supabase

Jalankan migrasi secara berurutan melalui SQL Editor Supabase:

1. `supabase/migrations/0001_surprise_pages.sql` — membuat bucket privat `surprise-media` dan skema lama yang masih ada di proyek.
2. `supabase/migrations/0002_special_day.sql` — kolom kompatibilitas skema lama.
3. `supabase/migrations/0003_midtrans_pages_orders.sql` — tabel `pages`, `orders`, indeks, RLS, serta RPC aktivasi/kegagalan.

Tabel yang dipakai checkout saat ini adalah `pages` dan `orders`, bukan `surprise_pages`. Bucket `surprise-media` harus berstatus privat. Aplikasi hanya mengakses tabel melalui service role di server; RLS tidak memiliki policy publik.

RPC penting:

- `activate_midtrans_order(...)` mengaktifkan halaman, mencatat `paid_at`, dan menghitung masa aktif 3/14 hari atau `NULL` untuk Abadi.
- `fail_midtrans_order(...)` mencatat order gagal tanpa menurunkan order yang sudah sukses.
- Kedua RPC bersifat idempoten, memakai transaksi/lock Postgres, dan hanya dapat dieksekusi oleh `service_role`.

## 3. Konfigurasi notification URL

Di dashboard Midtrans, buka pengaturan merchant dan isi Payment Notification URL dengan endpoint publik aplikasi:

```text
https://suprizego.vercel.app/api/midtrans/notification
```

Endpoint harus dapat diakses Midtrans tanpa login. Untuk pengujian lokal, gunakan URL publik yang meneruskan request ke aplikasi lokal; `127.0.0.1` tidak dapat diakses Midtrans.

Finish redirect yang diminta Snap adalah:

```text
https://suprizego.vercel.app/selesai?order=ORDER_ID
```

Redirect ini hanya menampilkan status dari database. Redirect tidak pernah mengaktifkan halaman.

## 4. Alur checkout

1. Editor mengirim `multipart/form-data` ke `POST /api/checkout`: JSON draf, foto, dan voice note opsional.
2. Server memvalidasi paket, momen, desain, musim Hari Spesial, cerita, batas foto/game, voice note, serta magic bytes berkas.
3. Server membuat ID halaman, slug acak 40 karakter, dan order ID unik.
4. Foto dan voice note diunggah ke path privat `${pageId}/...`.
5. Server menyimpan halaman `pending` dan order `pending` dengan harga dari `lib/pricing.ts`.
6. Server meminta Snap token ke Midtrans, menyimpan token, lalu mengirim token dan client key ke editor.
7. Editor membuka Snap. Success/pending diarahkan ke `/selesai?order=...`; error/cancel kembali ke editor dengan pesan yang jelas.
8. Webhook terverifikasi mengubah status database. Halaman `/selesai` melakukan polling selama status pending.

Paket dan harga:

| Paket | Harga server | Masa aktif |
| --- | ---: | --- |
| Dasar | Rp5.000 | 3 hari |
| Plus | Rp10.000 | 14 hari |
| Abadi | Rp15.000 | Selamanya (`active_until = NULL`) |

Metode yang diminta ke Snap: QRIS, GoPay, ShopeePay, DANA, BCA VA, BNI VA, BRI VA, Permata VA, dan Mandiri e-channel. Ketersediaan aktual tetap mengikuti konfigurasi merchant Midtrans.

## 5. Verifikasi webhook

Webhook memverifikasi:

- Signature SHA512: `order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY`.
- Order ada, nominal database sesuai harga server, nominal notifikasi sama, dan currency `IDR` bila dikirim.
- Halaman ada dan paketnya sama dengan order.
- Status `settlement`/`capture` mengaktifkan melalui RPC; `deny`/`expire`/`cancel`/`failure` mencatat kegagalan.
- Status tidak dikenal diakui tanpa aktivasi agar notifikasi tidak diproses sebagai sukses.

Halaman publik `/p/[slug]` hanya memuat konten jika `pages.status = active`, `paid_at` terisi, dan masa aktif belum lewat. Halaman pending/gagal/kedaluwarsa menampilkan penjelasan ramah dan tetap `noindex`.

URL media dibuat sebagai signed URL satu jam hanya untuk halaman aktif. Path media harus berada di bawah ID halaman terkait dan tidak boleh memuat `..`.

## 6. Pengujian sandbox

1. Pastikan migrasi sudah diterapkan dan variabel sandbox sudah diisi.
2. Jalankan `npm run dev` atau `npm run build && npm run start`.
3. Buat halaman di `/buat/pengakuan` atau momen lain, pilih paket, lalu klik **Bayar & kirim**.
4. Gunakan metode pembayaran sandbox yang diaktifkan merchant.
5. Periksa halaman pending setelah Snap selesai.
6. Pastikan notification URL menerima webhook dan status berubah menjadi aktif.
7. Buka tautan hasil, salin tautan, buka WhatsApp, dan unduh QR.
8. Uji juga cancel/deny dan order duplikat; order sukses tidak boleh berubah menjadi gagal.

Harness lokal `.tmp/verify-phase6.mjs` dapat menguji logika aplikasi tanpa kunci nyata. Harness memakai Supabase/Midtrans mock dan hanya dimuat melalui `NODE_OPTIONS` khusus pengujian; tidak mengubah kode produksi.

## 7. Diagnosis umum

| Gejala | Pemeriksaan |
| --- | --- |
| Checkout 503 `unconfigured` | Midtrans server/client key atau Supabase service role belum lengkap. |
| Webhook 403 `invalid_signature` | Server key tidak cocok, payload berubah, atau request bukan dari Midtrans. |
| Webhook 400 `amount_mismatch` | Nominal order/notifikasi tidak sama dengan harga server. |
| Webhook 409 `page_mismatch` | Halaman tidak ada atau paket halaman berbeda dari order. |
| Webhook 500 `activation_failed` | RPC belum diterapkan, izin service role salah, atau koneksi database gagal. |
| Halaman terus pending | Notification URL belum benar, webhook gagal, atau pembayaran belum settlement/capture. |
| Foto/voice gagal dibuka | Bucket bukan privat, path tidak cocok, signed URL kedaluwarsa, atau halaman belum aktif. |

## 8. Checklist produksi

- [ ] Uji satu transaksi sandbox nyata sampai webhook settlement dan halaman aktif.
- [ ] Pastikan notification URL produksi sudah diisi dan dapat diakses Midtrans.
- [ ] Ganti `MIDTRANS_SERVER_KEY` dan `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` dengan kunci produksi.
- [ ] Set `MIDTRANS_IS_PRODUCTION=true`.
- [ ] Set `NEXT_PUBLIC_SITE_URL=https://suprizego.vercel.app`.
- [ ] Pastikan bucket `surprise-media` privat dan RLS aktif tanpa policy publik.
- [ ] Pastikan backup database Supabase aktif.
- [ ] Pantau log webhook dan order yang gagal di Midtrans serta Vercel.
- [ ] Jangan menaruh server key/service role key pada variabel `NEXT_PUBLIC_*`.
