# Spesifikasi Flow Demo Referensi — 390px

Status: riset selesai; implementasi dan verifikasi demo SuprizeGo selesai pada 27 November 2026.  
Tanggal riset: 26 November 2026.  
Referensi perilaku: `https://proposigo.app` (hanya dibaca; tidak ada checkout yang dikirim).  
Target pengamatan: Chrome headless, viewport 390 × 844px, deviceScaleFactor 1, touch aktif, `prefers-reduced-motion: no-preference`.

## 1. Ruang lingkup dan metode

Spesifikasi ini mencatat perilaku yang benar-benar teramati pada demo referensi, bukan asumsi dari brief. Pengujian dilakukan dengan Chrome DevTools Protocol (CDP): buka state bersih, dispatch input mouse/touch nyata, ambil screenshot, baca DOM/ARIA/computed style/animation, amati mutasi chat, ulangi melalui ULANG, ganti tema, lewati kuis, dan jalankan jawaban positif serta negatif.

Bundle publik referensi juga diperiksa secara read-only untuk memastikan perilaku yang tampak ambigu, terutama siklus tombol negatif dan chat bertahap. Spesifikasi ini tidak menyalin teks, font, logo, atau aset referensi ke SuprizeGo.

## 2. Temuan utama dan koreksi brief

| Brief/dugaan awal | Hasil pengamatan referensi saat ini |
| --- | --- |
| Layar cerita selalu hitam | Tema default PERMEN PINK membuat seluruh layar dalam telepon pink, termasuk cerita. Tema CHAT MALAM membuat seluruh layar hitam. Tidak ada transisi otomatis ke hitam khusus saat cerita. |
| Chat bertahap dengan indikator mengetik | Empat bubble muncul satu per klik LANJUT BACA. Bubble pertama langsung ada saat masuk. Tidak ada indikator mengetik, timer, atau jeda penyisipan bubble. |
| Ada notifikasi setelah selesai membaca | Tidak teramati notifikasi khusus saat menekan SELESAI BACA. |
| Tiga polaroid | Demo memakai dua polaroid. |
| Foto keluar dari layar saat diganti | Yang terverifikasi adalah urutan foto bertukar dengan transisi 300ms. Tidak ada animasi terbang keluar layar. |
| COBA LAGI berarti mengulang pertanyaan | COBA LAGI hanya label kedua dari siklus tombol Nggak yang berputar tanpa akhir. |
| Tombol Nggak hanya menghindar saat hover/klik | Handler referensi menangani `pointerenter`, `pointerdown`, dan `click`; satu interaksi mouse atau sentuhan dapat menambah tiga hitungan. |
| Mengganti tema hanya mengubah warna | Mengganti tema mereset seluruh demo ke amplop, mengosongkan notifikasi, dan menghapus pil musik. |
| Notifikasi penerima menyebut “raka” | Demo memakai nama penerima; adaptasi SuprizeGo memakai Sekar. |

Implementasi SuprizeGo harus mengikuti kolom kanan. Indikator mengetik tidak boleh ditambahkan karena akan membuat flow berbeda dari referensi.

## 3. Token visual dan geometri global

### Warna terukur

| Token | Nilai |
| --- | --- |
| Cream | `#FFF4E0` / `rgb(255, 244, 224)` |
| Ink | `#111111` / `rgb(17, 17, 17)` |
| Lime | `#B6F22E` / `rgb(182, 242, 46)` |
| Pink | `#FF8FB8` / `rgb(255, 143, 184)` |
| Coral | `#FF6A3D` / `rgb(255, 106, 61)` |
| White | `#FFFFFF` |

### Telepon dan konten

- Posisi telepon pada viewport 390px: `x = 25px`.
- Lebar telepon: `340px`; border: `6px` ink; radius: `38.4px`.
- Shadow telepon: `10px 10px 0 #111`.
- Tinggi dasar/minimum: `640px`; tinggi bertambah mengikuti isi.
- Permukaan dalam: `x = 31px`, lebar `328px`, tinggi dasar `628px`.
- Area konten utama: `x = 47px`, lebar `296px`.
- Padding atas permukaan: `20px`; padding horizontal: `16px`; padding bawah minimum: `40px`.
- Telepon memiliki overflow tersembunyi di desktop; pada preview mobile yang memanjang, konten internal dapat mengalir ke bawah.

### Progress dots

- Selalu delapan titik.
- Ukuran `12 × 12px`, border `2px`, radius penuh.
- Gap horizontal `6px`.
- Warna dot terisi mengikuti warna teks permukaan: ink pada pink, cream pada hitam.
- Dot yang belum terisi transparan dengan border senada.

| Layar/substate | Dot terisi |
| --- | ---: |
| Amplop | 1 |
| Sapaan | 2 |
| Cerita/chat | 3 |
| Kenangan | 4 |
| Kuis Q1/Q2, skor, pilihan jadwal, tiket | 5 |
| Pertanyaan akhir dan respons | 6 |
| Surat | 7 |
| Kartu kenangan | 8 |

### Pil musik

- Tidak ada pada layar amplop.
- Muncul setelah amplop dibuka.
- Ukuran sekitar `74 × 31px`.
- Background cream, border `3px` ink, radius `12px`, shadow `3px 3px 0 #111`.
- Font sekitar `11px`.
- Label default `♪NYALA`; toggle menjadi `♪MATI`, lalu kembali `♪NYALA`.
- Reset menghapus pil; membuka ulang memunculkan kembali `♪NYALA`.

### Kontrol bawah demo

- Dua tombol tema berada dalam satu baris:
  - PERMEN PINK: sekitar `146 × 42px`, cream bila tidak dipilih.
  - CHAT MALAM: sekitar `141 × 42px`, cream bila tidak dipilih.
  - Tema terpilih memakai lime.
- Tombol `↺ ULANG`: sekitar `108 × 42px`, cream, berada di tengah baris berikutnya.
- Tombol memakai border `3px` ink, radius `12px`, shadow `4px 4px 0 #111`, font display sekitar `13.6px`.
- Semua kontrol berada di bawah permukaan telepon, bukan overlay fixed.
- Saat kartu kenangan memperpanjang telepon menjadi sekitar `889px`, kontrol ikut turun: baris tema sekitar `y = 1817px`, ULANG sekitar `y = 1867px` pada halaman penuh.
- Tombol tema dan ULANG tetap tersedia pada semua layar.

### Panel pengirim

- Di sebelah kanan telepon pada desktop; di bawah demo pada mobile.
- Background white, border `4px` ink, radius `20px`, shadow `8px 8px 0 #111`.
- Rotasi ringan sekitar `0.6deg`.
- Ukuran awal sekitar `360 × 209px`; setelah terisi sekitar `361 × 313px`.
- Judul “YANG MASUK KE RAKA PENGIRIM” dan stiker “PENGIRIM”.
- State awal hanya berisi petunjuk dalam box dashed.
- Notifikasi muncul sebagai daftar aktivitas penerima; state tidak berpindah ke layar baru.

### Chat melayang

- Bulatan lime dengan border ink tebal dan hard shadow.
- Ukuran sekitar `48 × 48px`, di dekat sudut kanan bawah viewport.
- Tampil terpisah dari isi demo.

## 4. Animasi dan transisi

| Elemen | Animasi/transisi | Durasi/easing |
| --- | --- | --- |
| Pembungkus konten setiap layar | `rise`: opacity `0 → 1`, translateY `24px → 0` | `500ms`, `cubic-bezier(0.16, 1, 0.3, 1)` |
| Ilustrasi amplop/sapaan | `float`: translateY `0 → -14px`, rotasi `-2deg → 2deg` | `4000ms`, ease-in-out, infinite |
| Bubble chat baru | `rise` | `500ms`, easing rise |
| Umpan balik kuis | `pop`: scale `0.4 → 1` | `450ms`, `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| Konfeti setelah MAU | 110 partikel canvas, gravitasi/drag/rotasi | `3200ms`, lalu kanvas dibersihkan |
| Polaroid berganti urutan | transition posisi/layout | `300ms`, `cubic-bezier(0.4, 0, 0.2, 1)` |
| Tombol Nggak berpindah | `transition-all` | `200ms` |
| Tombol biasa | transform, box-shadow, background | `120ms` |
| Kedip mata maskot | blink | Siklus sekitar `4500ms` |

Tidak teramati animasi keluar khusus saat berpindah layar. State baru masuk dengan rise; state lama langsung diganti. Pada `prefers-reduced-motion: reduce`, animasi harus dinonaktifkan tanpa mengubah urutan, state, atau keterbacaan.

## 5. Urutan layar dan perilaku per layar

### 5.1 Amplop

- Progress: 1/8.
- Background: pink pada PERMEN PINK; hitam pada CHAT MALAM.
- Isi:
  - Badge miring “ADA TITIPAN BUAT…” (adaptasi teks orisinal).
  - Nama penerima uppercase, font display besar.
  - Satu ilustrasi amplop besar.
  - Helper “(ketuk amplopnya)”.
- Tombol amplop:
  - Sekitar `288 × 197px`.
  - ARIA `Ketuk amplop untuk membuka`.
  - Mengambang dengan `float`.
- Tidak ada pil musik.
- Panel pengirim masih menunjukkan petunjuk awal.
- Aksi membuka amplop:
  - Menginisialisasi musik menjadi nyala.
  - Mencatat aktivitas `👀 [Nama] membuka halamanmu`.
  - Maju ke sapaan.

### 5.2 Sapaan

- Progress: 2/8.
- Background sesuai tema; pill `♪NYALA` muncul.
- Isi:
  - Ilustrasi surat/amplop mengambang.
  - Kartu cream berisi sapaan.
  - Tombol hitam `BUKA →` dengan shadow lime; sekitar `133 × 59px`.
- Tombol BUKA maju ke cerita.
- Tidak ada notifikasi baru pada tombol ini.

### 5.3 Cerita/chat

- Progress: 3/8.
- Label `CERITA DARI RAKA`.
- Background tetap pink pada tema default; seluruh isi hitam pada CHAT MALAM.
- Empat bubble pada demo referensi:
  - Bubble bergantian kiri/kanan.
  - Cream untuk bubble kiri, lime untuk bubble kanan.
- Bubble pertama langsung terlihat saat layar dibuka.
- Setiap klik `LANJUT BACA →` menambah satu bubble; klik berikutnya pada bubble terakhir memakai `SELESAI BACA →`.
- Bubble baru sudah terlihat sekitar 140ms setelah klik; pengamatan mutasi dan source menunjukkan tidak ada timer/indikator mengetik.
- Gaya bubble:
  - Maksimum `88%` lebar konten.
  - Radius `16px`, border `4px` ink.
  - Padding horizontal `16px`, vertikal `12px`.
  - Tebal, line-height snug, shadow `5px 5px 0 #111`.
- `SELESAI BACA →` maju ke kenangan.
- Tidak ada notifikasi baru saat bubble dibaca atau saat selesai membaca.

### 5.4 Kenangan

- Progress: 4/8.
- Judul `KENANGAN`.
- Dua polaroid:
  - Depan awal: “Sore itu di bukit”.
  - Belakang: “Bakso langganan”.
- Polaroid:
  - White, border `4px` ink, radius `10px`, shadow `8px 8px 0 #111`.
  - `transition-all duration-300`.
- Ketuk polaroid depan menukar urutan polaroid.
- `FOTO LAIN` melakukan siklus yang sama.
- Tidak terverifikasi animasi foto terbang keluar layar; perilaku yang diimplementasikan adalah reorder/cycle.
- Kontrol:
  - `FOTO LAIN`: sekitar `113 × 42px`, cream.
  - `LANJUT →`: sekitar `122 × 42px`, ink.
- Helper “ketuk foto untuk menggeser”, sekitar `12px`, bold, opacity `0.7`.
- Tidak ada notifikasi baru pada layar ini.

### 5.5 Kuis — soal 1

- Progress berubah dari 4 menjadi 5 dot.
- Badge `MAIN BERDUA · 1/2` berada dalam wrapper `p` tengah dengan margin bawah `16px`; stiker miring `-2deg`.
- Judul `KUIS KENAL AKU` dan subtitle berada dalam grup tengah dengan margin bawah `16px`.
- Tiap soal baru masuk dengan `rise`.
- Judul `KUIS KENAL AKU`.
- Tiga pilihan jawaban; setiap pilihan sekitar `248 × 56px`.
- Pilihan salah:
  - Coral.
  - Penanda X.
- Pilihan benar:
  - Lime.
  - Penanda centang.
- Umpan balik muncul dengan `pop`.
- Jawaban salah pertama menampilkan:
  - Jawaban benar.
  - Penjelasan singkat.
  - `SOAL BERIKUTNYA →`.
- Aksi skip berada dalam wrapper `mt-6 text-center`.
- `lewati permainan ini` langsung menuju pilihan jadwal; tidak menambahkan notifikasi skor.
- Jika kuis dilewati, baris skor tidak muncul di kartu kenangan akhir.

### 5.6 Kuis — soal 2 dan skor

- Soal 2 menampilkan subtitle `2/2`; badge atas tetap `MAIN BERDUA · 1/2`.
- Jawaban benar menampilkan umpan balik positif dan `LIHAT SKOR →`.
- Layar skor:
  - Menampilkan jumlah jawaban benar dari dua soal.
  - Tombol `GAME BERIKUTNYA →`.
  - Menambahkan notifikasi `🎮 Kuis Kenal Aku · X/2 benar`.
- Skor, pilihan jadwal, dan tiket tetap memakai 5 dot terisi.

### 5.7 Pilihan jadwal

- Badge berubah menjadi `MAIN BERDUA · 2/2`, dengan wrapper dan margin yang sama seperti kuis.
- Judul serta subtitle berada dalam grup tengah `mb-4`; konten masuk dengan `rise`.
- Tiga pilihan tanggal; warna bergantian lime/coral/lime.
- Aksi skip berada dalam wrapper `mt-6 text-center`.
- Memilih jadwal:
  - Menampilkan tiket jadwal.
  - Menambahkan notifikasi `🎮 Rencana Bareng · Pilih: ...`.
- `LANJUT →` pada tiket maju ke pertanyaan akhir.

### 5.8 Pertanyaan akhir

- Progress: 6/8.
- Pertanyaan `MAU JADI PACARKU?`.
- Tombol MAU lime; ukuran awal sekitar `102 × 63px`.
- Tombol Nggak coral pada PERMEN PINK; pink pada CHAT MALAM; ukuran awal sekitar `131 × 63px`.
- Pilihan MAU:
  - Menampilkan respons positif.
  - Menambahkan `💚 [Nama] jawab MAU`.
  - Jika sebelumnya mengejar tombol Nggak, menambahkan `(setelah Nx ngejar tombol Nggak)`.
  - Menampilkan `LANJUT →`.
- Tombol Nggak:
  - Berputar melalui tujuh label tanpa akhir:
    `NGGAK → YAKIN? → COBA LAGI → IH KABUR → AWAS! → NGGAK BISA → MENYERAH? → NGGAK ...`
  - Berpindah acak di dalam container relatif tinggi sekitar `144px`.
  - Memakai `transition-all duration-200`.
  - Menangani `pointerenter`, `pointerdown`, dan `click`.
  - Tidak menambah notifikasi.
  - Tidak pernah menjadi state akhir; LANJUT hanya tersedia setelah MAU dipilih.
- Perbedaan input penting:
  - Hover, pointerdown, dan click mouse masing-masing dapat menambah hitungan.
  - Satu klik mouse dapat melompat tiga label; pada prosedur verifikasi referensi, `NGGAK` menjadi `IH KABUR`.
  - Satu sentuhan pada prosedur verifikasi referensi juga dapat menambah tiga hitungan; `IH KABUR` menjadi `MENYERAH?`, lalu `MENYERAH?` menjadi `COBA LAGI`.
  - Karena reposisi acak, posisi berikutnya tidak deterministik meskipun urutan labelnya deterministik.
  - Catatan implementasi: Chrome dapat menghilangkan click kompatibilitas bila tombol touch berpindah. SuprizeGo menormalisasi event mouse/touch agar satu interaksi tetap menghasilkan tiga hitungan.

### 5.9 Respons positif dan surat

- Respons MAU tetap memakai 6 dot.
- Maskot amplop memakai mata berbentuk hati.
- MAU memicu konfeti canvas: 110 partikel, warna lime/pink/coral/ink/cream, gravitasi, drag, rotasi, dan umur `3200ms`.
- Konfeti tidak digambar pada `prefers-reduced-motion: reduce`.
- Kartu respons dan pertanyaan memakai radius `20px`, padding `20px`, border `4px`, shadow `5px 5px 0 #111`.
- Tombol LANJUT maju ke surat.
- Surat memakai 7 dot.
- Isi:
  - Label `UNTUK [NAMA]`.
  - Kartu surat cream, radius `20px`, rotasi sekitar `-1deg`, padding `24px`.
  - `LANJUT →`, sekitar `154 × 59px`.
- Tidak ada notifikasi baru pada surat.

### 5.10 Kartu kenangan

- Progress: 8/8.
- Judul `KARTU KENANGAN KALIAN` memakai label uppercase kecil (`text-xs`, bold, tracking lebar) dalam `p` dengan margin bawah `12px`.
- Kartu SVG memakai rasio `360 / 640`.
- Komposisi kartu:
  - Dua polaroid dengan pita tape dan hati di antaranya.
  - Nama penerima dan kartu surat cream berotasi dengan hard shadow.
  - Pill jawaban `JAWABANNYA: MAU` yang terpusat dengan sparkles.
  - Chip metadata putih bertepi ink dashed; skor dan janji hanya muncul bila tersedia.
  - Footer ink membentang flush ke dasar kartu.
- Isi ringkasan:
  - Jawaban akhir.
  - Jadwal yang dipilih.
  - Skor kuis bila kuis diselesaikan.
  - Skor tidak ditampilkan bila kuis dilewati.
- Aksi berada dalam grup `mt-6 flex flex-col items-center gap-4`:
  - `📲 BAGIKAN KE STORY`: penuh `296 × 59px`, ink.
  - `SIMPAN JADI GAMBAR`: penuh `296 × 42px`, cream.
  - `BIKIN JUGA BUAT DIA →`: penuh `296 × 59px`, lime.
- Ekspor SuprizeGo menghasilkan PNG `1080 × 1920`; berbagi memakai Web Share API dengan fallback clipboard.
- Telepon memanjang menjadi sekitar `889px`; kontrol tema dan ULANG pindah ke bawah kartu.
- Tampilan ini bukan halaman baru di luar telepon.

## 6. Siklus, ULANG, dan penggantian tema

- ULANG dapat ditekan dari layar mana pun.
- Hasil ULANG:
  - Kembali ke amplop.
  - Progress menjadi 1 dot.
  - Pil musik hilang.
  - Notifikasi pengirim dikosongkan.
  - Panel kembali ke petunjuk awal.
  - Pilihan tema dipertahankan.
- Reset dari kartu kenangan terverifikasi pada 180ms dan 1180ms: amplop dan satu dot sudah tampak.
- Mengganti PERMEN PINK ↔ CHAT MALAM:
  - Mengganti seluruh background permukaan, warna teks, dan pola (`bg-dots` untuk pink; `bg-grid` untuk hitam).
  - Mereset demo seperti ULANG.
  - Tema baru dipertahankan selama replay berikutnya.
- Membuka ulang amplop setelah reset memunculkan kembali `♪NYALA`.
- Persistensi state `♪MATI` melewati reset belum diisolasi; jangan menjadikannya kontrak perilaku.

## 7. Pemetaan notifikasi pengirim

| Trigger | Notifikasi |
| --- | --- |
| Amplop dibuka | `👀 [Nama] membuka halamanmu` |
| BUKA ditekan | Tidak ada |
| Membaca setiap bubble / SELESAI BACA | Tidak ada |
| Melihat/menggeser foto | Tidak ada |
| Menyelesaikan kuis | `🎮 Kuis Kenal Aku · X/2 benar` |
| Melewati kuis | Tidak ada |
| Memilih jadwal | `🎮 Rencana Bareng · Pilih: ...` |
| Menekan MAU | `💚 [Nama] jawab MAU` |
| Mengejar Nggak sebelum MAU | Suffix `(setelah Nx ngejar tombol Nggak)` pada notifikasi MAU |
| Surat / kartu kenangan | Tidak ada notifikasi baru |
| ULANG atau ganti tema | Semua notifikasi dihapus |

## 8. Perbedaan perilaku desktop/mobile

- Pengukuran spesifik pada fase ini memakai 390px.
- Pada desktop, telepon dan panel pengirim berada berdampingan; pada mobile, panel berada di bawah telepon.
- Telepon desktop memiliki tinggi tetap dasar `640px` dan scroll internal; pada preview mobile yang memanjang, telepon tumbuh dan halaman ikut mengalir.
- Ukuran, warna, urutan, dan logika state tidak berubah hanya karena viewport.
- Kontrol bawah selalu mengikuti akhir permukaan telepon, bukan menempel pada viewport.

## 9. Aturan adaptasi SuprizeGo

- Ubah hanya demo pada fase implementasi berikutnya; jangan mengubah fitur di luar demo.
- Gunakan teks orisinal bahasa Indonesia dengan panjang baris yang sebanding.
- Bima adalah pengirim; Sekar adalah penerima.
- Semua ilustrasi, termasuk amplop dan polaroid, digambar sebagai SVG flat orisinal dengan outline tebal.
- Jangan menyalin teks, logo, font, atau aset Proposigo.
- Pertahankan urutan state, delapan dot, posisi kontrol, warna, trigger, timing, dan reset persis seperti spesifikasi ini.
- Jangan menambahkan indikator mengetik, notifikasi selesai baca, ketiga foto, atau state terminal COBA LAGI.
- Musik harus tetap menjadi kontrol nyata; bila browser memblokir autoplay, pemutaran baru boleh dimulai setelah gesture pengguna, tanpa mengubah tampilan atau state flow.
- Dukung `prefers-reduced-motion: reduce`.
- Verifikasi pada 390px dan desktop, termasuk sentuhan, mouse, jawaban salah/benar, skip kuis, ganti tema, ULANG, dan kartu kenangan.

## 10. Artefak bukti

- `.tmp/trace-reference.mjs` — playthrough utama dan alternatif.
- `.tmp/probe-reference.mjs` — fokus musik, chat, polaroid, reset, dan skip.
- `.tmp/probe-negative.mjs` — fokus jawaban negatif, MAU, surat, kartu kenangan, dan reset.
- `.tmp/probe-*.json` dan screenshot terkait — pengukuran DOM/computed style per state.
- `.tmp/negative-*.json` dan screenshot terkait — jejak siklus Nggak dan respons MAU.
- `.tmp/reference-bundles.txt` — konfirmasi read-only implementasi chat dan tombol Nggak.
- `.tmp/inspect-reference-layout.json` — DOM referensi untuk cover sampai kartu kenangan.
- `.tmp/verify-demo-flow.mjs` — verifikasi SuprizeGo mobile/desktop, input nyata, skip, reset, audio, share, unduhan, dan reduced-motion.
- `.tmp/demo-flow-verification.json` — hasil 15 pemeriksaan final dan daftar screenshot.
- `.tmp/suprizego-flow-*.png` — screenshot bersih setiap tahap demo.
- `.tmp/demo-downloads/kartu-kenangan-bima-sekar.png` — bukti unduhan PNG `1080 × 1920`.

## 11. Audit baseline SuprizeGo sebelum perbaikan

Audit dilakukan pada 26 November 2026 terhadap build produksi dan interaksi browser 390/320/1440px.

| Area | Baseline SuprizeGo | Perbaikan yang diperlukan |
| --- | --- | --- |
| Urutan | Foto → chat sapaan → chat pengakuan → chat penutup | Gunakan seluruh urutan 12 state pada bagian 5 |
| Trigger | Chat maju otomatis setiap 900ms | Hapus auto-advance; semua transisi melalui tombol |
| Progress | Hanya 1–4 dot terisi | Terapkan pemetaan 1–8 |
| Tema | Selalu pink | Tambahkan PERMEN PINK/CHAT MALAM dan reset saat ganti tema |
| Awal | Langsung foto | Tambahkan amplop dan sapaan |
| Cerita | Kartu berlabel | Gunakan empat bubble bergantian kiri/kanan tanpa indikator mengetik |
| Foto | Tiga polaroid, animasi terbang/naik | Dua polaroid dengan reorder 300ms |
| Kuis/jadwal | Tidak ada | Tambahkan kuis, skor/skip, jadwal, dan tiket |
| Pertanyaan | Tidak ada | Tambahkan MAU dan siklus tombol Nggak |
| Surat/kartu | Tidak ada | Tambahkan surat satu kartu dan kartu kenangan |
| Musik | Pill tersedia sejak layar pertama | Sembunyikan sampai amplop dibuka; mulai nyata setelah gesture |
| Kontrol | Ulang hanya setelah layar pertama | Dua tema dan ULANG selalu tersedia |
| Notifikasi | Tiga notifikasi otomatis berdasarkan stage | Hanya trigger buka, skor, jadwal, dan MAU |
| Kontak | Tidak ada di demo | Tambahkan tombol email melayang |
| Animasi | Token global berbeda | Gunakan animasi demo scoped sesuai bagian 4 |
| Reset | Kembali ke foto | Kembali ke amplop, bersihkan state/notifikasi/musik, pertahankan tema |

## 12. Hasil implementasi dan verifikasi SuprizeGo

Implementasi dilakukan hanya pada komponen demo dan dokumen ini. Tidak ada perubahan pada harga, paket, pembayaran, backend, atau data pada fase ini.

Perbaikan fidelity yang diterapkan:

- Urutan 12 state dan pemetaan delapan dot.
- Sapaan amplop, empat bubble chat bertahap, dua polaroid, kuis, skor, jadwal, pertanyaan, respons, surat, dan kartu kenangan.
- Warna, radius kartu, spacing badge/judul/skip, ukuran tombol, dan posisi kontrol sesuai pengukuran referensi.
- Maskot mata-hati serta konfeti canvas 110 partikel.
- Kartu kenangan rasio `360 / 640`, kartu surat berotasi, pill jawaban, chip dashed kondisional, dan footer ink flush.
- Panel notifikasi memakai `min-w-0` agar pesan MAU panjang tidak memperlebar viewport mobile.
- Mouse dan sentuhan dinormalisasi menjadi tiga hitungan per interaksi tombol Nggak.
- Kontak melayang membuka panel email dan menyatakan bukan chat langsung.

Verifikasi final pada 27 November 2026:

- `npm run typecheck` lulus.
- ESLint scoped untuk seluruh komponen demo yang diubah lulus.
- `npm run build` lulus untuk seluruh route.
- CDP melalui `.tmp/verify-demo-flow.mjs` lulus 15 pemeriksaan tanpa error runtime.
- Viewport mobile tetap `390px` tanpa overflow horizontal, termasuk setelah notifikasi MAU panjang.
- Telepon desktop tetap `340 × 640px`.
- Audio nyata dapat dimatikan dan dinyalakan kembali.
- Skip kuis/jadwal menghilangkan metadata skor/janji pada kartu kenangan.
- Reduced-motion menonaktifkan rise, float, dan piksel konfeti.
- Ekspor gambar terverifikasi sebagai PNG valid `1080 × 1920`.
