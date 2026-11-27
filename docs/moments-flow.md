# Alur Lima Momen Contoh

Tanggal pembaruan: 27 November 2026.  
Route: `/contoh/pengakuan`, `/contoh/ulang-tahun`, `/contoh/anniversary`, `/contoh/minta-maaf`, dan `/contoh/wisuda`.

## 1. Kerangka bersama

Kelima momen memakai `SurpriseReader`, mesin state `lib/flow.ts`, progress delapan titik, serta urutan makro yang sama dengan demo hero:

1. Amplop.
2. Polaroid/galeri pink.
3. Surat/chat hitam.
4. Pertanyaan khas momen.
5. Penutup dan tombol ulangi.

Urutan ini menggantikan layar sapaan terpisah serta layar game/letter/penutup yang sebelumnya terpisah. Cerita dan surat digabung agar alur tetap pendek tanpa menghilangkan isi.

## 2. Pemetaan progres

| Bagian | Dot terisi | Catatan |
| --- | ---: | --- |
| Amplop | 1 | Musik belum tampil |
| Galeri | 4 | Tab Main Berdua opsional tetap di layar ini |
| Cerita dan surat | 6 | Konten panjang dapat di-scroll |
| Pertanyaan | 7 | Interaksi khas momen |
| Penutup | 8 | Bikin versimu / ulangi |

## 3. Perbedaan per momen

| Momen | Penerima/pengirim contoh | Pertanyaan | Interaksi khusus |
| --- | --- | --- | --- |
| Pengakuan | Sekar / Bima | “Mau jadi pacarku?” | Tombol negatif menghindar dan labelnya berputar |
| Ulang Tahun | Bima / Sekar | “Apa harapanmu tahun ini?” | Kue dan tiga lilin dapat dipadamkan melalui tombol “Tiup lilin” |
| Anniversary | Sekar / Bima | “Masih mau bareng aku?” | Galeri kenangan dan pilihan “Masih, selalu” |
| Minta Maaf | Sekar / Bima | “Maafkan aku, ya?” | Pilihan “Aku maafkan” atau “Butuh waktu”; tidak ada tombol yang kabur |
| Wisuda | Bima / Sekar | “Bangga nggak sama aku?” | Pilihan apresiasi dan penutup tanpa permainan tambahan |

Semua teks di atas adalah copy orisinal SuprizeGo. Tidak ada teks atau aset referensi yang disalin.

## 4. Galeri dan Main Berdua

- Bila ada foto, tampilkan galeri tap-to-cycle dengan `next/image`.
- Bila tidak ada foto, tampilkan empty state orisinal dan lanjutkan ke surat.
- Bila ada game yang valid untuk paket, tampilkan tab Foto/Main Berdua pada layar galeri.
- Main Berdua memakai batas game dari `lib/plans.ts`; tidak ada batas yang ditebak dari client.
- Menyelesaikan game maju ke surat. Melewati foto ketika game tersedia membuka tab game.
- Game tidak pernah memunculkan layar makro baru di luar lima langkah.

## 5. Cerita, surat, suara, dan musik

- Cerita dibagi menjadi bubble berdasarkan kalimat/paragraf.
- Dua bubble cerita pertama terlihat lebih dulu; tombol membaca menambah bubble berikutnya.
- Setelah cerita selesai, tombol “Buka surat” menampilkan surat pada area scroll yang sama.
- Voice note tampil sebelum bubble surat bila tersedia.
- Musik latar memiliki kontrol nyata dan hanya dimulai setelah gesture pengguna.
- Bila autoplay ditolak, reader menampilkan status tanpa mengubah urutan.
- Konten panjang tidak memotong tombol lanjut karena area konten menggunakan flex + scroll internal.

## 6. Reset, reduced-motion, dan edge case

- “Ulangi dari awal” mengembalikan ke amplop, mereset mode galeri/game, dan menghentikan musik.
- Route contoh selalu `noindex`.
- Tanpa foto: empty state orisinal.
- Tanpa musik: pil musik tidak dirender.
- Tanpa game: tab Main Berdua tidak dirender.
- Tanpa cerita/surat: reader menampilkan surat fallback orisinal agar layar tidak kosong.
- Nama penerima kosong memakai “Kamu”; nama pengirim kosong memakai “Pembuat halaman”.
- `prefers-reduced-motion: reduce` menonaktifkan rise, float, transisi, dan konfeti tanpa mengubah state.

## 7. Verifikasi

Build dan lint dijalankan setelah fase ini. Pengujian browser mencakup kelima route pada 390px, alur lengkap, reset, foto kosong, musik tidak tersedia, game tidak tersedia, tombol negatif, tiup lilin, serta reduced-motion.
