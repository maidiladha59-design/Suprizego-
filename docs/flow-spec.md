# Spesifikasi Flow Demo SuprizeGo — 390px

Tanggal pembaruan: 27 November 2026.

Referensi riset: `https://proposigo.app`.

Target implementasi: brief fase Tahap 3, yaitu alur singkat berikut.

> Catatan sumber: demo referensi yang diamati masih memiliki alur lama yang lebih panjang. Brief Tahap 3 secara eksplisit meminta alur singkat di bawah, sehingga brief tersebut menjadi sumber kebenaran implementasi SuprizeGo. Tidak ada teks, logo, font, atau aset referensi yang disalin.

## 1. Urutan utama

```text
amplop → polaroid pink → surat/chat hitam → pertanyaan & jawaban → panel pengirim → ULANG → amplop
```

Panel pengirim adalah panel di luar telepon, bukan layar keenam di dalam telepon. Tombol ULANG tersedia pada kontrol bawah dan pada layar jawaban.

## 2. Mesin state bersama

- Definisi layar: `lib/flow.ts`.
- Controller: `components/surprise/use-flow-controller.ts`.
- Progress delapan titik: `components/surprise/flow-progress.tsx`.
- Demo hero dan reader memakai ID layar serta pemetaan progres yang sama.

| ID | Layar | Dot terisi | Background |
| --- | --- | ---: | --- |
| `envelope` | Amplop | 1 | Pink dengan pola titik |
| `photo` | Polaroid dan galeri | 4 | Pink dengan pola titik |
| `letter` | Surat/chat hitam | 6 | Hitam; pola grid hanya pada tema Chat Malam |
| `question` | Pertanyaan akhir | 7 | Pink dengan pola titik |
| `closing` | Jawaban dan reset | 8 | Pink dengan pola titik |

Dot 2–3 dan 5 merepresentasikan bagian galeri/Main Berdua serta surat yang dapat dibaca bertahap. Visual delapan titik dipertahankan agar bahasa stepper SuprizeGo tetap konsisten.

## 3. Geometri dan komponen global

- Viewport acuan: `390 × 844px`, sentuhan aktif.
- Telepon: lebar `340px`, tinggi dasar/minimum `640px`, border `6px`, radius `38px`, shadow `10px 10px 0 #111`.
- Permukaan dalam: radius `28px`, overflow tersembunyi.
- Area konten: padding horizontal `20px`, padding bawah `24px`.
- Topbar: tinggi `58px`, berisi delapan dot dan pil musik.
- Pil musik tidak muncul pada amplop; muncul setelah amplop dibuka.
- Tombol tema dan ULANG berada di bawah telepon, bukan overlay fixed.
- Panel pengirim berada di samping telepon pada desktop dan di bawahnya pada mobile.
- Percakapan melayang tetap terpisah dari isi demo.

## 4. Perilaku per layar

### 4.1 Amplop

- Progress 1/8.
- Menampilkan nama penerima, stiker, dan amplop orisinal.
- Amplop mengambang lembut dan dapat ditekan.
- Aksi membuka:
  - Memulai musik melalui gesture pengguna; bila browser menolak, tampilkan status singkat.
  - Mencatat aktivitas “Sekar membuka halamanmu”.
  - Maju ke polaroid.
- Tidak ada auto-advance atau timer.

### 4.2 Polaroid pink

- Progress 4/8.
- Dua polaroid orisinal dengan outline tebal.
- Ketuk foto depan atau tombol “Foto lain” untuk menukar urutan.
- Transisi reorder `300ms`.
- Tombol “Lanjut” maju ke surat/chat.
- Pada reader produksi, galeri foto menggunakan foto nyata. Bila kosong, tampilkan empty state orisinal, bukan foto palsu.
- Bila paket memiliki Main Berdua, reader menyediakan tab Foto/Main Berdua pada layar yang sama; game tidak menambah layar makro baru.

### 4.3 Surat/chat hitam

- Progress 6/8.
- Background selalu hitam.
- Tema Permen Pink memakai permukaan hitam polos; tema Chat Malam menambahkan pola grid halus.
- Pergantian pink ↔ hitam memakai transisi warna `500ms`.
- Bubble chat bergantian kiri/kanan dengan cream dan lime.
- Dua bubble pertama terlihat saat layar dibuka; setiap klik menambah satu bubble.
- Tidak ada indikator mengetik dan tidak ada jeda otomatis.
- Tombol terakhir membaca “Selesai baca” lalu maju ke pertanyaan.
- Reader produksi menggabungkan cerita dan surat pada layar ini. Setelah cerita selesai, surat serta voice note tampil di area scroll yang sama.

### 4.4 Pertanyaan dan jawaban

- Progress 7/8.
- Pertanyaan menggunakan teks orisinal sesuai momen.
- Tombol positif selalu dapat dipilih.
- Pada pengakuan, tombol negatif menghindar dengan label berputar dan posisi acak di dalam area `144px`.
- Satu interaksi sentuhan atau mouse dinormalisasi agar tidak menghasilkan beberapa lompatan yang tidak disengaja.
- Jawaban positif memicu konfeti singkat dan aktivitas panel pengirim.
- Tidak ada jawaban negatif yang mengakhiri demo.

### 4.5 Jawaban dan panel pengirim

- Progress 8/8.
- Layar jawaban menampilkan konfirmasi dan tombol ULANG.
- Panel pengirim di luar telepon menampilkan aktivitas:
  - Amplop dibuka.
  - Jawaban positif, termasuk jumlah percobaan mengejar tombol negatif bila ada.
- Panel memiliki `aria-live="polite"` dan tidak memicu navigasi.
- ULANG mengembalikan demo ke amplop, mengosongkan aktivitas, menghentikan musik, mereset skor/jawaban sementara, dan mempertahankan pilihan tema.

## 5. Kontrol, animasi, dan aksesibilitas

- Tema Permen Pink/Chat Malam dapat diganti kapan saja; mengganti tema mereset demo.
- Tombol ULANG tersedia pada semua layar.
- Animasi layar: rise `500ms`.
- Amplop/maskot: float `4000ms`.
- Bubble baru: rise `500ms`.
- Konfeti: canvas orisinal, hanya pada jawaban positif.
- Semua transisi menghormati `prefers-reduced-motion: reduce`; state dan urutan tidak berubah.
- Fokus keyboard terlihat, tombol memiliki label ARIA, dan status musik menggunakan role status.
- Tidak ada konten bergerak yang menyembunyikan tombol atau teks penting.

## 6. Verifikasi yang diwajibkan

1. Mainkan penuh dari amplop sampai ULANG minimal dua kali.
2. Uji klik dan sentuhan pada foto, chat, tombol negatif, serta jawaban positif.
3. Pastikan panel pengirim hanya berisi aktivitas nyata dan ter-reset.
4. Pastikan tema malam hanya memengaruhi layar surat/chat.
5. Periksa viewport 390px tanpa overflow horizontal.
6. Ulangi dengan reduced-motion dan pastikan tidak ada animasi rise/float/konfeti.

## 7. Artefak verifikasi

- `.tmp/verify-phase3.mjs` — playthrough hero dan lima momen pada viewport 390px.
- `.tmp/phase3-verification.json` — hasil pemeriksaan urutan, reset, tema, interaksi, dan reduced-motion.
- `.tmp/phase3-*.png` — screenshot amplop, polaroid, surat, pertanyaan, dan penutup.
