# Audit fitur paket SuprizeGo

Tanggal audit: 27 November 2026.

Status menggambarkan perilaku nyata pada Tahap 6, bukan hanya copy pemasaran. Fitur yang belum siap tetap tampil di pricing dengan label kecil **Segera hadir**.

| Fitur | Status | Bukti dan batasan |
| --- | --- | --- |
| Main Berdua | Bekerja lokal | Empat jenis permainan dapat dimainkan di reader, batas game mengikuti paket, skip dan skor berfungsi. Hasil belum dikirim atau disimpan ke pengirim. |
| Kapsul waktu | Segera hadir | Belum ada jadwal pembukaan, kolom waktu buka, atau validasi masa tunggu. |
| Ucapan bareng | Segera hadir | Belum ada tabel ucapan, formulir publik, moderasi, atau tampilan ucapan bersama. |
| Voice note | Bekerja | Rekaman, unggahan file, putar ulang, hapus, batas 60 detik/5 MB, dan IndexedDB berfungsi. Setelah checkout, berkas disimpan privat di Supabase Storage dan diputar melalui signed URL pada halaman aktif. Server memvalidasi format dan magic bytes; durasi masih mengacu pada metadata recorder. |
| Lagu Spotify | Segera hadir | Editor memvalidasi dan menyimpan tautan track Spotify untuk Plus/Abadi, tetapi tautan belum diputar atau diubah menjadi embed. |
| Link custom | Segera hadir | Halaman masih memakai slug acak 40 karakter; belum ada reservasi atau validasi slug pilihan. |
| Kartu QR | Bekerja | Halaman `/selesai` membuat QR server-side dari tautan publik aktif, menyediakan unduhan, dan memakai data URL agar tidak bergantung layanan QR eksternal. |
| Simpan jadi gambar | Bekerja | Layar penutup membuat kartu PNG 1080×1350 orisinal berisi nama, momen, pengirim, warna tema, dan tautan halaman. Tidak memuat foto eksternal sehingga tidak tergantung CORS. |
| Papan Abadi | Segera hadir | Belum ada opt-in, daftar publik, pagination, atau moderasi. |
| Desain eksklusif | Segera hadir | Belum ada desain tambahan khusus Abadi; paket Abadi saat ini memakai desain yang sama. |
| Bisa diedit lagi | Sebagian | Draf dapat diedit dan otomatis dipulihkan di perangkat ini. Belum ada tautan edit terautentikasi setelah pembayaran atau sinkronisasi lintas perangkat. |

## Perbaikan yang dikerjakan pada Tahap 5

- `lib/plans.ts` sekarang menyimpan status `ready` atau `soon` untuk setiap fitur tanpa mengubah harga, nama paket, durasi, atau batas foto/game.
- Pricing menampilkan label **Segera hadir** hanya untuk fitur yang memang belum siap.
- Musik bawaan dapat diputar dari pratinjau reader dan kontrol musik mengikuti pemilihan draf; pemutaran berhenti saat reset atau komponen dilepas.
- Tombol **Simpan jadi gambar** membuat kartu PNG orisinal tanpa dependensi tambahan.
- Copy Main Berdua tidak lagi mengklaim skor atau pilihan dikirim ke pengirim karena belum ada API penyimpanan jawaban.
- Copy editor Spotify tidak lagi mengklaim pencarian lagu atau pemutaran yang belum tersedia.

## Pembaruan Tahap 6

- Voice note dan Kartu QR berubah menjadi `ready`, sehingga jumlah label **Segera hadir** pada pricing menjadi 11.
- Halaman publik hanya dapat dibuka setelah webhook Midtrans terverifikasi mengaktifkan order dan halaman; redirect Snap tidak mengaktifkan halaman.
- Foto, caption, voice note, paket, tema, game, dan durasi aktif dipulihkan dari database server, bukan dari localStorage penerima.
- Spotify divalidasi dan disimpan, tetapi tetap **Segera hadir** karena pemutaran/embed belum diimplementasikan.
- Fitur lain tetap berstatus jujur sesuai batasan pada tabel; tidak ada UI atau data contoh yang mengklaim fitur tersebut sudah berjalan.

## Asumsi

- “Simpan jadi gambar” diimplementasikan sebagai kartu kenangan dari layar penutup, bukan tangkapan layar penuh seluruh halaman.
- Kartu PNG sengaja tidak memakai foto pengguna agar unduhan selalu berhasil tanpa masalah canvas lintas origin.
- Main Berdua tetap menjadi fitur interaksi lokal sampai backend jawaban benar-benar dibuat.
- Fitur yang memerlukan halaman publik, pembayaran, atau penyimpanan permanen akan diverifikasi ulang setelah Tahap 6.

## Verifikasi Tahap 5

- `npm run typecheck`, `npm run lint`, dan `npm run build` lulus tanpa warning.
- Chrome CDP 390×844 menemukan tepat 13 label **Segera hadir**, tanpa horizontal overflow.
- Unduhan `kartu-bima.png` valid sebagai PNG 1080×1350, ukuran 111.229 byte, dan tombol unduh tetap terlihat pada layar penutup.
- Musik bawaan otomatis nyala setelah amplop, dapat dimatikan, hilang untuk pilihan “Tanpa Musik”, dan kembali saat musik dipilih ulang.
- Tidak ada exception runtime atau error console pada skenario verifikasi.

## Verifikasi Tahap 6

- Harness integrasi `.tmp/verify-phase6.mjs` memakai Supabase dan Midtrans mock tanpa kunci nyata.
- Harga client yang dimanipulasi diabaikan; Plus tetap Rp10.000 dari `lib/pricing.ts`.
- Signature salah, nominal salah, magic bytes palsu, voice di paket Dasar, kelebihan foto, hari di luar musim, Spotify host asing, desain asing, dan cerita kurang dari tiga kartu ditolak.
- Settlement mengaktifkan Plus selama 14 hari; webhook duplikat tidak memperpanjang masa aktif; kegagalan lanjutan tidak menurunkan order sukses; Abadi memiliki `active_until` null.
- Browser 390×844 melewati alur editor → Snap mock → pending → settlement → hasil aktif dengan QR, salin tautan, WhatsApp, dan tanpa horizontal overflow.
- Artefak: `.tmp/phase6-verification.json`, `.tmp/phase6-pending-390.png`, dan `.tmp/phase6-success-390.png`.
- Uji transaksi Midtrans nyata dan migrasi SQL nyata tetap menjadi tindakan pengguna karena kredensial tidak tersedia di workspace.
