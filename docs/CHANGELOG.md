# Changelog implementasi SuprizeGo

## 2026-11-27

### Tahap 1 — Perbaikan cepat

- `metadataBase` memakai `NEXT_PUBLIC_SITE_URL` dan default `https://suprizego.vercel.app`.
- Email kontak memakai `NEXT_PUBLIC_CONTACT_EMAIL`; tidak ada alamat email hardcoded. Tautan kontak disembunyikan jika env belum diisi.
- Setiap kartu Hari Spesial menautkan ke `/contoh/[id]`; 17 id dibangkitkan dari `lib/special-days.ts` dengan contoh orisinal Bima–Sekar.
- Badge paket tidak dirender jika teksnya sama dengan tagline, sehingga Plus tidak lagi menduplikasi “Pilihan fleksibel”.
- Dua kalimat hero dipisahkan sebagai elemen block yang eksplisit.

### Asumsi dan keputusan

- Referensi dipakai untuk struktur, urutan, ritme, dan perilaku; seluruh teks serta ilustrasi SuprizeGo tetap orisinal.
- Contoh Hari Spesial memakai reader bersama dan `specialDay` untuk tema; fase tema akan melengkapi variabel visual.
- Tanpa kunci Midtrans dari pengguna, implementasi sandbox, skema, validasi, dan dokumentasi dapat diselesaikan, tetapi transaksi live hanya dapat diuji setelah env tersedia.
- Fitur yang belum dapat diimplementasikan ditandai “Segera hadir”, bukan dihapus atau dibuat seolah sudah berfungsi.
- Verifikasi Tahap 1: `npm run lint` dan `npm run build` lulus tanpa error atau warning.
- Replay referensi live masih menunjukkan alur lama 12 tahap, sedangkan brief final meminta alur ringkas. Implementasi mengikuti brief eksplisit: amplop → polaroid pink → surat/chat hitam → jawaban → panel pengirim → ULANG.

### Tahap 2 — Kontras, simbol, dan encoding

- Menghapus opasitas dari teks aktif dan mengganti teks sekunder dengan `ink`/`ink-soft` atau `cream` solid; opasitas hanya tersisa pada kontrol nonaktif dan dekorasi.
- Kartu Hari Spesial memakai teks permukaan terpisah untuk kartu gelap, sehingga teks cream tidak lagi berada di atas permukaan cream.
- Kartu terkunci memakai border dashed, latar subdued, ikon gembok, dan teks solid yang terbaca.
- Pill tanggal dapat membungkus dua baris, tidak terpotong, dan section mendapat padding bawah 144px pada mobile agar aman dari chat mengambang.
- Seluruh emoji UI diganti ikon SVG orisinal, termasuk 17 ikon Hari Spesial, aktivitas pengirim, musik, reset, panah, dan tanda jawaban.
- Simbol `✦`, `♪`, dan `↺` diganti SVG; dukungan font untuk `…` dan `·` diverifikasi di Chrome.
- Pemindaian UTF-8 fatal decoder dan pola mojibake bersih; HTML produksi memuat `<meta charset="utf-8">`.
- Audit Chrome headless 390×844: tidak ada horizontal overflow atau error runtime, enam kartu terbaca, pill tanggal tidak terpotong, kontras minimum terukur 6,64:1.

### Tahap 3 — Alur demo dan momen

- Mesin state bersama ditambahkan di `lib/flow.ts` dan `components/surprise/use-flow-controller.ts`; demo hero dan reader memakai lima ID layar serta pemetaan delapan dot yang sama.
- Demo hero dipangkas menjadi amplop → polaroid pink → surat/chat hitam → pertanyaan/jawaban → penutup/ULANG. Layar sapaan, kuis, jadwal, surat terpisah, dan kartu kenangan lama dihapus dari alur.
- Tema Chat Malam hanya menambahkan pola gelap pada layar surat/chat; layar lain tetap pink. Pergantian background memakai transisi 500ms.
- Reader produksi menggabungkan cerita dan surat pada layar hitam, menyediakan galeri foto/empty state, serta tab Main Berdua opsional tanpa menambah layar makro.
- Interaksi khusus ditambahkan: tombol negatif yang kabur pada pengakuan dan tiup lilin pada ulang tahun. Galeri foto tetap tap-to-cycle.
- Kelima contoh momen dan seluruh contoh Hari Spesial memakai Bima–Sekar serta copy orisinal.
- `docs/flow-spec.md` ditulis ulang untuk target eksplisit; `docs/moments-flow.md` ditambahkan.
- Enam komponen layar demo lama yang tidak lagi diimpor dihapus agar TypeScript tidak mengompilasi jalur mati.
- Verifikasi browser CDP 390×844 lulus untuk hero dan lima momen: urutan lengkap, reset, pergantian foto, chat bertahap, tema malam, tombol kabur, tiup lilin, Main Berdua skip, tanpa musik/foto/game, dan reduced-motion. Tidak ada overflow horizontal atau error runtime.
- Verifikasi akhir Tahap 3: `npm run lint`, `npm run typecheck`, dan `npm run build` lulus.

### Asumsi Tahap 3

- Panel pengirim dianggap panel di luar telepon, bukan layar keenam; karena itu alur dalam telepon tetap lima layar makro.
- Delapan dot dipertahankan sebagai bahasa visual bersama. Pemetaan adalah amplop 1, galeri 4, surat 6, pertanyaan 7, penutup 8; dot 2–3 dan 5 mewakili subprogres galeri/game dan pembacaan surat.
- Main Berdua tidak dihapus dari produk. Fitur tersebut dipindahkan menjadi tab opsional di layar galeri agar target demo tetap ringkas.
- Layar surat/chat selalu hitam. Pilihan Chat Malam hanya mengaktifkan pola grid pada layar tersebut, sedangkan Permen Pink memakai hitam polos.

### Tahap 4 — Logo tunggal dan tema Hari Spesial

- Komponen `Logo` tetap menjadi satu sumber artwork untuk header, editor, footer, favicon, dan Open Graph. Animasi lima ekspresi berjalan pada siklus 12,5 detik (masing-masing 2,5 detik), hover/tap menampilkan ekspresi terkejut, timer dibersihkan saat unmount, dan reduced-motion mempertahankan senyum statis.
- Tema visual untuk seluruh 17 Hari Spesial ditambahkan di `lib/special-day-themes.ts`: palet shell/layar/permukaan/aksen, sepuluh pola latar, tiga ikon SVG orisinal per hari, serta kicker dan opening copy orisinal.
- Reader menerapkan tema melalui `data-theme`, `data-pattern`, dan CSS custom properties. Amplop, galeri, pertanyaan, penutup, ilustrasi kenangan, dan latar halaman mengikuti tema; layar surat/chat tetap hitam agar alur Tahap 3 tidak berubah.
- Pemilihan Hari Spesial di editor langsung memperbarui pratinjau. Musim tetap dihitung server-side dari H−21 sampai H+3 dengan tanggal Asia/Jakarta.
- Verifikasi Tahap 4: `npm run lint`, `npm run typecheck`, dan `npm run build` lulus. Audit Chrome CDP 390×844 mencakup seluruh 17 contoh, kontras teks layar minimum 10,88:1, tiga ikon per tema, tanpa konten terpotong/overflow/error runtime, alur lengkap dan reset untuk tema terang serta gelap, serta pemilihan Hari Guru di editor.
- Artefak verifikasi: `.tmp/phase4-verification.json`, `.tmp/phase4-*-390.png`, dan `.tmp/logo-verification.json`.

### Asumsi Tahap 4

- Contoh Hari Spesial dapat dibuka sepanjang tahun dengan temanya; editor hanya mengizinkan satu hari yang sedang musim, sesuai aturan produk sebelumnya.
- Setiap hari memakai tiga ikon dari pustaka SVG orisinal SuprizeGo agar dekorasi konsisten tanpa menyalin aset referensi.
- Tema tidak mengubah warna hitam wajib pada layar surat/chat; aksen tema tetap muncul pada bubble, tombol, dan ilustrasi di sekitarnya.

### Tahap 5 — Audit dan implementasi fitur paket

- `docs/feature-audit.md` mencatat status nyata 11 fitur paket, batasan implementasi, dan asumsi penyimpanan/publikasi.
- `lib/plans.ts` memakai status fitur `ready`/`soon`; harga, nama paket, durasi, batas foto, dan batas game tidak berubah. Pricing menampilkan label kecil **Segera hadir** pada 13 baris fitur yang belum siap.
- Musik bawaan kini dapat diputar dari reader/pratinjau melalui pilihan draf, muncul di kontrol header, berhenti saat reset/unmount, dan hilang saat pengguna memilih “Tanpa Musik”.
- Layar penutup menambahkan **Simpan jadi gambar**: kartu PNG orisinal 1080×1350 dengan nama penerima/pengirim, momen, palet tema, dan tautan halaman. Kartu tidak memakai foto eksternal agar bebas masalah CORS.
- Copy Main Berdua dan editor Spotify diperbaiki agar tidak mengklaim pengiriman hasil, pencarian lagu, atau pemutaran Spotify yang belum tersedia.
- Verifikasi Tahap 5: `npm run typecheck`, `npm run lint`, dan `npm run build` lulus tanpa warning. Audit Chrome CDP 390×844 memastikan 13 label “Segera hadir”, tanpa overflow, unduhan PNG valid 111.229 byte, musik bawaan nyala/mati/pilihan tanpa musik, serta tidak ada error runtime.
- Artefak verifikasi: `.tmp/phase5-verification.json`, `.tmp/phase5-pricing-390.png`, `.tmp/phase5-closing-390.png`, `.tmp/phase5-editor-music-390.png`, dan `.tmp/phase5-downloads/kartu-bima.png`.

### Asumsi Tahap 5

- “Simpan jadi gambar” berarti kartu kenangan dari layar penutup, bukan tangkapan seluruh halaman atau galeri foto.
- Voice note masih ditandai **Segera hadir** di pricing karena unggahan permanen belum diaktifkan, meskipun recorder dan IndexedDB sudah berfungsi.
- Main Berdua tetap berfungsi sebagai permainan lokal; tidak ada klaim hasil terkirim sampai API jawaban tersedia.
- Fitur yang bergantung pada halaman publik akan dinilai ulang setelah checkout, unggahan media, dan aktivasi webhook Tahap 6 selesai.

### Tahap 6 — Checkout dan webhook Midtrans sandbox

- `lib/pricing.ts` menjadi satu sumber harga server: Dasar Rp5.000/3 hari, Plus Rp10.000/14 hari, Abadi Rp15.000/selamanya dengan harga coret Rp20.000.
- Migrasi `0003_midtrans_pages_orders.sql` menambahkan tabel `pages` dan `orders`, RLS tanpa policy publik, indeks, serta RPC aktivasi/kegagalan yang atomik dan idempoten.
- `POST /api/checkout` memvalidasi payload dan magic bytes foto/voice, menghitung harga di server, membuat slug acak 40 karakter, menyimpan halaman/order pending, mengunggah media privat, lalu meminta Snap token.
- Editor **Bayar & kirim** membuka Snap dan menangani success, pending, error, serta close/cancel tanpa mengaktifkan halaman dari client.
- Webhook memverifikasi SHA512 signature, nominal, currency, konsistensi paket/halaman, lalu mengaktifkan atau mencatat kegagalan melalui RPC.
- `/p/[slug]` hanya menampilkan konten untuk halaman aktif, sudah dibayar, dan belum kedaluwarsa; status lain mendapat halaman ramah `noindex`.
- `/selesai` menyediakan status pending dengan polling, tautan yang dapat disalin, WhatsApp, QR server-side beserta unduhan, ringkasan paket, dan retry untuk pembayaran gagal.
- Voice note dan foto/caption kini tersimpan permanen di Supabase Storage privat dan dipulihkan lewat signed URL. Voice note dan Kartu QR berubah menjadi fitur siap; label **Segera hadir** berkurang dari 13 menjadi 11.
- `docs/MIDTRANS.md`, `README.md`, dan `docs/feature-audit.md` diperbarui dengan konfigurasi, endpoint, pengujian, batasan, dan checklist deploy.
- Harness `.tmp/verify-phase6.mjs` lulus tanpa kunci nyata: manipulasi harga client ditolak, signature/nominal/magic bytes/entitlement/validasi draf diuji, settlement Plus 14 hari dan Abadi selamanya benar, webhook duplikat idempoten, kegagalan tidak menurunkan order sukses, serta browser 390×844 melewati Snap mock → pending → aktif dengan QR/salin/WhatsApp tanpa error runtime.
- Artefak Tahap 6: `.tmp/phase6-verification.json`, `.tmp/phase6-pending-390.png`, dan `.tmp/phase6-success-390.png`.

### Asumsi Tahap 6

- Kredensial Midtrans dan Supabase nyata tidak tersedia di workspace; integrasi diuji dengan mock, sedangkan transaksi sandbox nyata dan penerapan migrasi menjadi tindakan pengguna.
- Masa aktif dihitung dari `settlement_time` Midtrans (fallback `transaction_time`, lalu waktu server) dalam interpretasi WIB untuk format timestamp Midtrans tanpa zona.
- Tautan Spotify divalidasi dan disimpan tetapi belum diputar, sehingga fitur tetap ditandai **Segera hadir**.
- Durasi voice note divalidasi dari metadata recorder dan ukuran/format berkas, bukan decoding audio independen di server.
- Halaman hasil hanya membaca status database dan tidak pernah menjadi jalur aktivasi pembayaran.
