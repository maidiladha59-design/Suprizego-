# Spesifikasi Referensi — proposigo.app → SuprizeGo

Status: **FASE 1 (riset) selesai** — dokumen ini murni hasil pengukuran, belum ada kode produk.
Metode: headless Chrome via CDP, viewport 1440×1000 (desktop) dan 390×844 (mobile), halaman ID & EN, termasuk halaman penerima yang dijalankan penuh sampai kartu akhir.

> **PERINGATAN COPYRIGHT.** Semua teks Proposigo yang dikutip di bawah adalah **data pengukuran internal** (untuk mengukur panjang, nada, dan struktur), bukan bahan untuk disalin. Sesuai brief, SuprizeGo menulis ulang seluruh copywriting, logo, dan ilustrasi sendiri dengan gaya yang sama (outline hitam tebal, isi warna datar).

> **Cakupan.** Riset read-only. Checkout di situs referensi **tidak pernah disubmit** (transaksi nyata). Bagian pembayaran didokumentasikan dari UI, FAQ, llms.txt, dan halaman legal saja.

---

## 1. Peta produk & model bisnis

Satu produk = satu "halaman ucapan" berisi 8 bagian interaktif yang dibuka penerima lewat satu link. Pembeli mengisi lewat wizard, pratinjau gratis tanpa batas, membayar sekali (tanpa langganan), lalu mengirim link. Penerima tidak perlu akun/aplikasi.

| Route | Fungsi | Auth | Index |
|---|---|---|---|
| `/`, `/en` | Landing: hero + demo yang bisa dimainkan | – | ya |
| `/buat` | Pemilih momen (6 momen + 19 tema hari spesial) | – | ya |
| `/buat/[momen]` | Wizard 8 bagian + pratinjau langsung | – | ya |
| `/momen/[momen]` | Landing per momen + contoh + mini-demo | – | ya |
| `/momen/[momen]/[audiens]` | Landing SEO per audiens (mis. gebetan, sahabat) | – | ya |
| `/hari`, `/hari/[hari]` | Hub hari spesial + halaman per hari (tema terkunci + "kabari aku") | – | ya |
| `/ide`, `/ide/[slug]` | Hub ide kata-kata + artikel panjang dengan deep link "kirim ini" | – | ya |
| `/papan` | Papan Abadi: kutipan publik dari paket Abadi | – | ya |
| `/masuk`, `/daftar`, `/lupa-sandi`, `/atur-sandi`, `/verifikasi` | Akun opsional (email+sandi / Google) | – | tidak |
| `/dasbor` | Kelola halaman & pembelian (redirect ke `/masuk?next=%2Fdasbor` bila belum login) | ya | tidak |
| `/p/[slug]` | Halaman penerima (link panjang acak by default) | – | **noindex** |
| `/checkout` | Form data pembeli (di dalam drawer) + bayar | – | tidak |
| `/selesai` | Kembali dari pembayaran | – | tidak |
| `/berhenti` | Berhenti langganan email "kabari aku" | – | tidak |
| `/terms`, `/privacy` (+ `/en/...`) | Legal, 12 bagian masing-masing | – | ya |
| `/api/*`, `/admin` | Internal | – | diblokir robots |

Model: bayar sekali per halaman; pratinjau gratis; akun pembeli opsional (checkout punya "Sudah punya akun? Masuk" dan halaman "/dasbor" untuk mengelola); penerima tanpa akun.

---

## 2. Fondasi visual (global)

### 2.1 Token warna (terukur dari CSS variables)

| Token | Nilai | Pemakaian |
|---|---|---|
| cream | `#FFF4E0` | teks di atas ink, kartu surat, tombol sekunder |
| ink | `#111111` | border 3–6px, teks, footer, bayangan offset |
| lime | `#B6F22E` | CTA utama, sticker, stripe hero, tanda benar |
| pink | `#FF8FB8` | sticker, latar section "cara kerja" & halaman demo |
| coral | `#FF6A3D` | sticker/badge, tombol "Nggak" |
| white | `#FFFFFF` | kartu konten |

`theme-color` = lime. Tidak ada warna abu netral khusus; transparansi memakai cream/95 atau ink/10.

### 2.2 Tipografi

- **Display** — `Archivo Black`, uppercase, leading rapat.
  - H1 home: 72px/68.4 desktop → 41.6px/39.5 mobile.
  - H1 halaman lain: 48px/48–60; wizard: 36px/40.
  - Label tombol: 13.6px, letter-spacing 0.01em.
- **Mono/body** — `Space Mono` 400/700.
  - Body hero: 18px bold; body section: 16px.
  - Label kecil: 10–11px uppercase, tracking 0.2–0.25em.
  - Footer link: 14px.

### 2.3 Bentuk & bayangan

- Border konten: 3px ink (kartu), 4px (bubble/tiket), 6px (bingkai telepon).
- Radius: 12px tombol, 16–24px kartu (`rounded-2xl`), 38.4px bingkai telepon (`rounded-[2.4rem]`).
- Bayangan khas "offset keras" tanpa blur: `4px 4px 0 #111` (tombol), `5px 5px 0` (bubble/polaroid), `6px 6px 0` (kartu), `10px 10px 0` (bingkai telepon).
- Rotasi kecil pada elemen playful: −4°…+8°.

### 2.4 Komponen inti

- **`.nb-btn`** — inline-flex, gap 8px, border 3px ink, radius 12px, padding 8×16, font display 13.6px, shadow `4px 4px 0 #111`.
  - Varian: `ink` (ink/cream), `cream` (cream/ink), `lime`, `pink`, `coral`; ukuran `sm` (padding ~6×12, teks 12px).
  - State diam terukur di atas. Hover/pressed belum terukur → **keputusan SuprizeGo**: hover naik 1px + shadow 5px; active turun 2px + shadow 2px (pola neo-brutalist, verifikasi di QA).
- **`.nb-card`** — bg putih, border 2–3px ink, radius 16px, shadow 6px; kartu info/konten.
- **`.sticker`** — pill, border 3px ink, font display 11–12px, shadow 3px, rotasi −3°…+3°, bg pink/lime/coral.
- **Ticker/marquee** — strip setinggi ±56px, bg ink, teks lime, border bawah 4px; konten duplikat (lebar 2250px vs viewport 1425px) berjalan horizontal terus-menerus, pemisah `✦`.
- **Pola latar** — `bg-stripes` (garis diagonal lime/cream, dipakai hero & harga), `bg-dots` (titik, dipakai section pink & halaman demo), `bg-grid` (garis halus, kartu hari spesial).
- **Progress dots (halaman penerima)** — 8 titik 12px, border 2px, terisi ink sesuai progres, `aria-label="Bagian N dari 8"`.
- **Sticky header** — tinggi 72px, bg cream 95% (+blur), logo 189×44, link nav 14px bold: Momen, Cara kerja, Harga, Ide, Papan Abadi; lalu "Masuk" (teks) + "BIKIN SEKARANG" (nb-btn ink sm). Mobile: logo + tombol saja. **Tidak ada hamburger.**
- **Announcement bar** — di atas header, bg lime/kuning, 13px bold, teks + panah (mis. promo hari spesial), bisa ditutup? (belum terverifikasi).
- **Footer** — bg ink, teks cream, 4 kolom: deskripsi merek; MOMEN (5 link); PROPOSIGO (Bikin halaman, Harga, Ide, Papan Abadi, Dasbor); legal (Syarat, Privasi, Pengaturan cookie); baris bawah `© 2026 <merek> · <tagline>` + toggle "Bahasa Indonesia / English". Toggle bahasa ada di footer (bukan header).
- **Floating chat** — bulatan lime 56px, ikon 💬, fixed kanan-bawah (di mobile menutupi sticker hero — perilaku referensi; SuprizeGo perlu jarak aman).
- **Cookie banner** — fixed bawah, `role="region" aria-label="Pengaturan cookie"`, kartu cream border 3px shadow 4px; judul "🍪 …?"; 2 tombol (tolak/manual + terima); teks menyebut cookie login & pembayaran selalu aktif, analitik opsional, halaman pribadi tidak dilacak; link Kebijakan Privasi.

### 2.5 Motion (status pengukuran)

Computed duration animasi tidak valid saat crawl (emulator reduced-motion membuat durasi ≈0s), jadi hanya **nama & pemicu** yang terdokumentasi:

- `animate-rise` — elemen masuk dari bawah + fade (kartu notifikasi, bubble, CTA akhir).
- `animate-pop` — feedback benar/skor.
- `animate-float` — ilustrasi mengambang pelan (hero/demo).
- `transition-all duration-200` — tombol "Nggak" yang kabur; `duration-300` pada beberapa transisi.
- Marquee berjalan linear tanpa jeda.

Untuk SuprizeGo: pakai 200ms (mikro), 350ms (rise/pop), 4–6s loop (float), easing `ease-out`; hormati `prefers-reduced-motion` (matikan float/marquee, sisakan fade 1 langkah).

### 2.6 Suara

- Tiap halaman punya musik latar (preset per momen / Spotify untuk paket Plus+). Toggle sticker "♪NYALA / ♪MATI" di halaman penerima; default nyala, bisa dimatikan penerima.
- Voice note ≤1 menit (paket Plus+).
- Efek suara klik/haptic: **belum teramati** (riset headless); jangan diklaim ada.

---

## 3. Spesifikasi per layar

Format tiap layar: **1 Tampilan · 2 Interaksi · 3 Rasa · 4 Aturan bisnis · 5 Teknis terlihat.**

### 3.1 Home (`/`, `/en`)

**1 Tampilan**
- Announcement bar → header sticky → hero.
- Hero: section `bg-lime bg-stripes border-b-4 border-ink`, tinggi ±1065px desktop (116px offset header). Grid 2 kolom: kiri copy, kanan panel demo + kartu notifikasi.
  - Sticker pink −2°: "Halaman ucapan interaktif".
  - H1 72px: "BERANI / BILANG." + kotak highlight cream border 4px shadow 6px, rotasi −1.5°: "KAMI YANG BIKIN MOMENNYA."
  - Paragraf 18px bold (maks 32rem), 2 CTA `nb-btn ink/cream` 18px ("Bikin halaman", "Lihat momen"), sticker pink −3° "mulai 5 ribu".
  - Kanan: bingkai telepon 340×640 (border 6px ink, radius 2.4rem, shadow 10px) + strip desain (PERMEN PINK / CHAT MALAM), tombol "↺ ULANG", dan kartu notifikasi putih miring 0.6° ("YANG MASUK KE <penerima>" + sticker "pengirim" lime) berisi item masuk satu per satu.
- Ticker ink/lime di bawah hero.
- `#momen` (max-w-6xl, py-20): label + "MOMEN APA?" + 5 kartu momen (Confess, Ulang Tahun, Anniversary, Minta Maaf, Wisuda) + kartu "Hari Spesial" ke-6; tiap kartu: ilustrasi, judul, deskripsi 1 baris, "Contoh ucapannya →", grid tinggi ±1088px.
- `#hari-spesial` (max-w-6xl): 6 kartu hari (Hari Guru "HARI INI!", Hari Ibu 🔒 22 Des, Natal 🔒 25 Des, Tahun Baru 🔒 1 Jan, Imlek 🔒 6 Feb, Valentine 🔒 14 Feb) dengan tanggal buka; dua CTA per kartu: "🎉 Rayakan" & "🙏 Minta maaf".
- `#cara-kerja` (border-y-4 ink, bg-pink bg-dots, py-20): "3 LANGKAH, SELESAI." + 3 kartu bernomor: Pilih momen / Isi ceritamu / Bayar & kirim.
- Fitur (max-w-6xl py-20): "BUKAN SEKADAR LINK." + 4 kartu: DIKABARI, GERAK SEMUA, SIMPAN GAMBAR, TANPA RIBET.
- `#harga` (border-y-4, bg-lime bg-stripes, py-20): "HARGANYA RINGAN." + subjudul "Sekali bayar. Beda paket = beda lama aktif." + 3 kartu paket (isi §4.1).
- FAQ (max-w-3xl): "MASIH PENASARAN?" + 5 item accordion.
- CTA akhir (max-w-5xl, tinggi ±248px): "UDAH SIAP BILANG?" + "Pratinjaunya gratis. Bayar baru saat kamu puas." + tombol besar.
- Footer.

**2 Interaksi**
- Nav anchor smooth-scroll (`scroll-mt-24`).
- Demo hero bisa dimainkan penuh (lihat §3.12) tanpa pindah halaman; tombol "↺ ULANG" mereset; toggle desain mengganti tema demo; toggle musik.
- Kartu notifikasi demo memperlihatkan log masuk secara berurutan (lihat §3.12-3).
- Ticker berjalan terus; hover CTA mengangkat tombol; FAQ accordion buka/tutup satu per satu (boleh multi? belum pasti — pilih satu terbuka).
- Toggle bahasa di footer → `/en` (dan sebaliknya).

**3 Rasa**
- Kesan "stiker tempel di buku catatan": rotasi, shadow keras, border tebal, warna blok.
- Demo adalah daya tarik utama: pengunjung bisa "mengalami" produk sebelum bayar.
- Copy santai, sapaan "kamu/dia", sedikit bercanda ("deg-degan").

**4 Aturan bisnis**
- 5 momen inti + 19 tema hari (6 tampil di home; sisanya di `/buat`).
- Harga & isi paket persis §4.1. Pratinjau gratis tanpa batas; bayar sekali.
- Klaim produk yang harus benar-benar ada di SuprizeGo: email saat dibuka & dijawab; kartu muncul satu-satu; polaroid bisa digeser; tombol "Nggak" kabur; simpan jadi gambar; tanpa akun/install untuk penerima; buka dari WA/IG.

**5 Teknis terlihat**
- `/en` untuk Inggris; hreflang `id`/`en`/`x-default`; canonical per bahasa.
- OG: judul/deskripsi per halaman, gambar `/og/home-id.png?v=3` 1200×630, `twitter:summary_large_image`, `og:locale id_ID` + alternatif `en_US`.
- Favicon: `/favicon.ico`, `/icon.png`, `/apple-icon.png`; theme-color lime.
- `sitemap.xml` memuat halaman publik; halaman `/p/` tidak.
- `robots.txt`: Disallow `/p/`, `/ucapan/`, `/api/`, `/admin`, `/dasbor`, `/en/dasbor`, `/checkout`, `/selesai`, `/edit`, `/en/edit`, `/atur-sandi`, `/lupa-sandi`, `/verifikasi`, `/berhenti` (aturan sama untuk daftar bot AI); `Host` + `Sitemap` absolut.
- `llms.txt`: ringkasan produk (penerima tanpa akun; bayar sekali; QRIS/e-wallet/VA untuk ID & MY via DOKU, kartu/PayPal/Apple Pay/Google Pay untuk luar negeri via Lemon Squeezy dalam USD; link privat panjang & tidak diindeks; kedaluwarsa sesuai paket; Indonesia default + `/en`).

### 3.2 `/buat` — pemilih momen

**1 Tampilan**
- Header + judul "Mau bikin apa?" (gaya display besar) + grid kartu 6 momen (ilustrasi, judul, 1 kalimat, badge paket mulai).
- Blok "Tema hari spesial" berisi 19 tombol; yang belum dibuka menampilkan 🔒 + tanggal buka (mis. Valentine 24 Jan, Imlek 16 Jan, Lebaran 17 Feb, Halloween 10 Okt, Natal 4 Des, Tahun Baru 11 Des, Hari Ayah 22 Okt, Hari Ibu 1 Des, Hari Anak 2 Jul, Kartini 31 Mar, Hardiknas 11 Apr, Kemerdekaan 27 Jul, Batik 11 Sep, Sumpah Pemuda 7 Okt, Pahlawan 20 Okt, Persahabatan 9 Jul; Hari Guru sedang musim).

**2 Interaksi**
- Klik kartu momen → `/buat/[momen]`. Klik tema terbuka → wizard dengan tema terpilih; tema terkunci non-klik + tooltip tanggal.
- Mendukung query `?momen=<slug>` dan `?hari=<slug>` dari tautan luar.

**3 Rasa** — seperti memilih kartu dalam kotak; ilustrasi besar, hover mengangkat.

**4 Aturan bisnis** — tema hari hanya bisa dipakai mulai tanggal bukanya; 6 tema inti selalu tersedia.

**5 Teknis** — halaman publik, canonical, ikut sitemap; deep-link `?ref=` diteruskan ke checkout/analytics.

### 3.3 `/buat/[momen]` — wizard

**1 Tampilan**
- Dua kolom di desktop: kiri form 8 kartu putih (`nb-card`, badge nomor 1–8); kanan pratinjau `sticky top-24` lebar 380px berlabel "PRATINJAU LANGSUNG", tombol "ULANGI DARI AWAL", dan tombol "Lihat pratinjau".
- Mobile: form dulu, pratinjau collapsible/sticky bawah; CTA bawah lengket "LANJUT BAYAR · RP<nominal paket terpilih>".
- 8 bagian: (1) Desain (2 pilihan per momen), (2) Nama & tanggal, (3) Cerita (3–5 kartu, ≤180 karakter/kartu, contoh bisa dipakai), (4) Foto (maks 8, caption), (5) Musik (preset per momen / Spotify untuk Plus+ / voice note ≤1 menit), (6) Permainan (pilih 1–3 sesuai paket; "Susun Foto" butuh foto), (7) Surat (≤1500 karakter), (8) Pertanyaan besar + link custom + paket.

**Field & batas terukur**

| Field | id | Batas/tipe |
|---|---|---|
| Nama pengirim | `sn` | teks, maks 40 |
| Nama penerima | `rn` | teks, maks 40 |
| Tanggal momen | `dt` | date (label beda per momen; opsional untuk sebagian) |
| Pertanyaan besar | `q` | teks, maks 80, placeholder "Mau jadi pacarku?" |
| Lagu | `sp` | teks, placeholder "Cari judul lagu atau tempel link" |
| Slug | `slug` | placeholder "mis. dinda-dan-raka", hanya Plus/Abadi |

- Contoh isi per momen disediakan ("PAKAI CONTOH ISI").
- Pilihan desain: Confess = PERMEN PINK / CHAT MALAM; Ulang Tahun = PESTA KONFETI / KUE CORAL; Anniversary = HATI PINK / SENJA CORAL; Minta Maaf = LANGIT TENANG / HUJAN GELAP; Wisuda = TOGA LIME / KAMPUS KREM; Rayakan = KADO LIME / PITA CORAL.
- Preset musik per momen (mis. Confess: DEG-DEGAN / MALU-MALU / TANPA MUSIK; Ultah: HAPPY BIRTHDAY / PESTA; Anniv: CANON IN D / SYAHDU; dst.).

**2 Interaksi**
- Autosave ke `localStorage` per momen: key `proposigo:draft:<momen>`, isi ± `{"design":"permen","c":{"photos":[],"song":"manis",…}}`.
- Pratinjau kanan meng-update langsung (nama, desain, warna, kartu).
- "ULANGI DARI AWAL" menghapus draft setelah konfirmasi.
- Klik "LANJUT BAYAR · RP…" membuka drawer checkout (data form baru di-mount saat itu).
- Tombol paket mengubah CTA sticky sesuai harga.

**3 Rasa** — mengisi seperti menyusun album; pratinjau instan memberi rasa aman; contoh isi menurunkan beban menulis.

**4 Aturan bisnis**
- 3–5 kartu cerita; surat ≤1500; 8 foto; pertanyaan ≤80; nama ≤40.
- Permainan mengikuti paket: Dasar 1, Plus 2, Abadi 3; "Susun Foto" tidak bisa dipilih tanpa foto.
- Spotify & voice note hanya Plus+; slug custom hanya Plus+; edit setelah bayar hanya Plus+.
- Semua isian divalidasi sebelum pembayaran (tidak ada form panjang saat checkout).

**5 Teknis**
- Draft lokal per perangkat, tidak tersinkron sebelum bayar (asumsi dari key localStorage).
- Setelah bayar, halaman tersimpan permanen dan link `/p/<slug-acak>` dibuat.
- Harga di CTA diambil dari paket terpilih, format `Rp10.000` (tanpa desimal).

### 3.4 `/momen/[momen]` — landing momen

**1 Tampilan**
- Hero grid 1fr/340px: judul display 48px, deskripsi, CTA "Bikin sekarang", sticker "mulai 5 ribu", kanan mini-demo telepon (contoh jadi, bisa dimainkan sebagian).
- Section "Contoh ucapannya": 4–6 kartu kutipan pendek.
- Section permainan: kartu 4 game (Kuis, Dua Jujur Satu Bohong, Susun Foto, Rencana Bareng) dengan deskripsi; satu game bisa dimainkan inline (kuis contoh).
- Section 2 desain (preview masing-masing).
- Section audiens: tautan ke halaman SEO audiens.
- Kartu contoh cerita (story preview).
- FAQ singkat + CTA + footer.

**2 Interaksi** — mini-demo playable; klik game inline bisa menjawab; CTA → wizard dengan momen terisi.

**3 Rasa** — "coba dulu, baru bikin"; contoh nyata lebih meyakinkan daripada fitur.

**4 Aturan bisnis** — contoh memakai nama fiktif; game yang ditampilkan sesuai paket (tidak menjanjikan fitur di paket murah).

**5 Teknis** — canonical; hreflang; OG per momen; sitemap; tautan silang ke audiens.

### 3.5 `/momen/[momen]/[audiens]` — landing SEO audiens

**1 Tampilan** — hero 1fr/220px, H1 "Untuk <audiens>", 6 contoh kalimat siap pakai, kartu tips, FAQ 3–4, tautan momen lain. (Contoh audiens: gebetan, sahabat, pasangan, orang tua.)

**2 Interaksi** — tiap contoh punya tautan "Kirim ini 💌" → `/buat/[momen]?ref=seo-<audiens>`; CTA utama ke wizard.

**3 Rasa** — halaman "jawaban cepat": pengunjung yang mencari kata-kata langsung mendapat contoh.

**4 Aturan bisnis** — konten orisinal (tidak menyalin); contoh bukan janji hasil.

**5 Teknis** — halaman publik terindeks; internal link ke artikel ide; OG sendiri.

### 3.6 `/hari` & `/hari/[hari]`

**1 Tampilan**
- Hub: grid kartu hari (ilustrasi, tanggal, status: "HARI INI!" / "N hari lagi" / "dibuka <tanggal>" + 🔒).
- Halaman hari: badge hari + tanggal besar, countdown, 6 contoh ucapan, tips, form "KABARI AKU" (email) untuk pengingat saat tema dibuka, daftar tema terkait, CTA "Atau bikin halaman tanpa tema sekarang →" ke `/buat/rayakan`.

**2 Interaksi**
- Form email satu kolom + tombol; setelah kirim → status sukses ("Sekali kirim saja. Bisa dihentikan lewat link di email.").
- Klik tema terkunci → tidak bisa dipakai sampai tanggal buka.

**3 Rasa** — hitung mundur + pengingat email menciptakan momentum musiman.

**4 Aturan bisnis** — pengingat sekali per alamat; bisa berhenti via `/berhenti`; tema hari hanya tersedia mulai tanggal yang tertera; email dikirim saat tema dibuka.

**5 Teknis** — `/hari?momen=...`? (tidak); OG per hari; halaman `?ref=…`; noindex untuk `/berhenti`.

### 3.7 `/ide` & `/ide/[slug]`

**1 Tampilan**
- Hub: judul, filter chip (kategori/momen), grid kartu artikel (±13 artikel) dengan judul + ringkasan + label momen.
- Artikel: H1 48px, paragraf pembuka, daftar panjang (±40 item) berisi kalimat contoh; tiap item punya tombol "KIRIM INI 💌"; section tips; CTA akhir; artikel terkait.

**2 Interaksi**
- Filter chip memfilter grid tanpa reload (atau query param).
- "KIRIM INI 💌" membuka wizard dengan teks contoh sudah terisi: `/buat/<momen>?ide=<slug>&n=<nomor>`.

**3 Rasa** — konten panjang yang benar-benar berguna; jembatan dari "cari kata-kata" ke "bikin halaman".

**4 Aturan bisnis** — teks contoh boleh dipakai pembeli (orisinal milik SuprizeGo); artikel harus akurat soal fitur.

**5 Teknis** — slug stabil; sitemap; deep link `ide` + `n`; canonical; OG.

### 3.8 `/papan` — Papan Abadi

**1 Tampilan** — heading "PAPAN ABADI", deskripsi singkat, baris filter (momen/kategori; saat riset semua hitungan 0), grid kartu kutipan (kosong → empty state ilustrasi + penjelasan), kartu CTA pink "Bikin kenangan selamanya" → paket Abadi.

**2 Interaksi** — filter; klik kartu membuka detail/kutipan penuh (belum terverifikasi); CTA → `/buat`.

**3 Rasa** — dinding publik yang hangat; bukti sosial **hanya** dari konten asli (jangan mengarang kutipan untuk SuprizeGo).

**4 Aturan bisnis** — hanya halaman paket Abadi yang bisa tampil (opsional, dengan izin pengirim & penerima); tanpa data nyata, tampilkan empty state jujur.

**5 Teknis** — publik; konten pengguna → moderasi; canonical; OG.

### 3.9 Auth & dasbor

**1 Tampilan** — `/masuk`: kartu cream/putih, judul "MASUK", subjudul, field EMAIL + PASSWORD, link "Lupa password?", tombol MASUK (ink), pemisah, tombol "LANJUT DENGAN GOOGLE", catatan "Masuk dengan Google berarti kamu berusia 13+ dan setuju Syarat & Kebijakan Privasi.", footer "Belum punya akun? Daftar". `/daftar` analog. `/dasbor` tanpa sesi → redirect `/masuk?next=%2Fdasbor`.

**2 Interaksi** — validasi email/sandi; error inline; setelah masuk → `next` atau dasbor.

**3 Rasa** — sederhana, tanpa dekorasi berlebih; akun terasa opsional.

**4 Aturan bisnis** — usia 13+; akun opsional untuk pembeli; penerima tidak pernah diminta akun.

**5 Teknis** — noindex; cookie sesi; Google OAuth; reset sandi via email.

### 3.10 Legal (`/terms`, `/privacy`)

**1 Tampilan** — sticker "LEGAL" berotasi, H1 48px, meta "Terakhir diperbarui 10 Nov 2026 · Versi 1", 12 section bernomor, daftar isi (di desktop), footer.

**2 Interaksi** — anchor per section; link silang Syarat ↔ Privasi; tombol "Pengaturan cookie" di privasi.

**3 Rasa** — tetap ramah tetapi jelas; tidak menyalin teks referensi.

**4 Aturan bisnis** — wajib mencakup: pembayaran sekali, masa aktif, data pribadi, foto, email notifikasi, cookie/analitik, hak penghapusan, refund (kebijakan belum terdokumentasi — **perlu keputusan pemilik**).

**5 Teknis** — versi + tanggal; halaman publik; EN mirror.

### 3.11 Checkout (drawer di wizard)

**1 Tampilan** — drawer/panel di atas halaman: ringkasan paket, form data pembeli (NAMA, EMAIL, checkbox 13+ & setuju Syarat/Privasi), tombol "LANJUT BAYAR"; teks "Sekali bayar · tidak ada langganan atau perpanjangan otomatis."; "Sudah punya akun? Masuk". Metode: QRIS (tanpa biaya tambahan), e-wallet, VA bank (biaya admin bank), atau kartu/PayPal/Apple Pay/Google Pay di luar ID/MY (USD).

**2 Interaksi** — form baru muncul setelah klik CTA lengket; validasi email; setelah bayar → kembali ke `/selesai` → link siap dibagikan + struk dikirim ke email.

**3 Rasa** — cepat, tanpa pindah halaman; harga terlihat sejak awal di CTA.

**4 Aturan bisnis** — sekali bayar; tanpa auto-renew; struk & info pembayaran ke email; halaman aktif sesuai paket; Dasar tidak bisa diedit, Plus/Abadi bisa.

**5 Teknis** — mata uang mengikuti IP (ID/MY = IDR); gateway DOKU (IDR) & Lemon Squeezy (USD) di referensi → **SuprizeGo: gateway menunggu keputusan pemilik**; kunci API hanya di `.env`.

### 3.12 Halaman penerima (`/p/[slug]`) — alur 8 bagian

**1 Tampilan**
- Bingkai telepon (desktop) / full-screen (mobile) dengan latar warna desain + `bg-dots`.
- Header mini: 8 progress dots + sticker musik "♪NYALA / ♪MATI".
- Bagian:
  1. **Amplop** — sticker coral "ada titipan buat…", nama penerima 5xl, ilustrasi amplop coral flap lime hati cream, teks "(ketuk amplopnya)".
  2. **Sapaan** — ilustrasi + kartu "HAI, <NAMA>!" + tombol "Buka →".
  3. **Cerita** — 3–5 bubble chat muncul satu per satu (kiri cream, kanan lime), shadow 5px, tombol "Lanjut baca →" (terakhir "Selesai baca →").
  4. **Kenangan** — tumpukan polaroid (aspect 9/11, rotasi, taped), caption; "ketuk foto untuk menggeser"; tombol "Foto lain"/"Lanjut →".
  5. **Permainan** — sesuai pilihan: Kuis Kenal Aku (soal + opsi; benar jadi lime ✓, salah 0.55 & nonaktif; "Bener! 🎉"; skor "2/2"; "KAMU KENAL BANGET!"), Dua Jujur Satu Bohong, Susun Foto, Rencana Bareng (pilihan rencana → jadi tiket). Tombol "lewati permainan ini".
  6. **Tiket janji** — border putus-putus, "TIKET JANJI · BERLAKU 1X", "Dinda + Raka", "tidak bisa dibatalkan, cuma bisa dijadwalkan 😌".
  7. **Pertanyaan besar** — maskot gelembung lime + pertanyaan; tombol "MAU" (lime) dan "NGGAK" (coral, `absolute`, `transition-all duration-200`, `touch-action:none`) yang kabur saat didekati/diklik dan berganti label (NGGAK → YAKIN? → AWAS! → IH KABUR → MENYERAH? → NGGAK BISA → COBA LAGI; ukuran membesar hingga ±186×91).
  8. **Kartu kenangan** — kartu 360×640 (diskalakan ±0.822 dalam bingkai max 360): badge momen coral, stempel tanggal putus-putus, 2 polaroid, hati + sparkle, "UNTUK" + nama 44px, medali amplop, kartu surat "SURATNYA" + tanda tangan, sticker "✦ JAWABANNYA: MAU ✦", chip skor kuis & janji, footer ink/lime merek + ajakan bikin. Tombol: "📲 Bagikan ke Story", "Simpan jadi gambar", "Bikin juga buat dia →".

**2 Interaksi**
- Amplop diketuk → bagian 2; tiap bagian lanjut dengan tombol; dots update.
- Polaroid diketuk untuk menaikkan foto; tombol lanjut.
- Kuis: pilih jawaban → feedback → soal berikutnya → skor → game berikutnya.
- Tombol Nggak menghindar (pointerenter + click), label & ukuran berubah; akhirnya hanya Mau yang tersisa → closing.
- Setelah MAU: kartu konfirmasi "… pasti senyum-senyum sekarang. 💚" + "Lanjut →" → kartu kenangan; bagikan via Web Share API, unduh PNG.
- Musik bisa dimatikan kapan saja; pilihan bertahan selama sesi.

**3 Rasa**
- Urutan dramatis: buka amplop → cerita hangat → foto → main → janji → pertanyaan → kejutan kartu.
- Tombol Nggak = lelucon utama; tidak boleh terasa memaksa atau menyebalkan.
- Animasi rise/pop, ilustrasi goyah (`float`), suara musik lembut.

**4 Aturan bisnis**
- Link panjang acak, privat, noindex; masa aktif sesuai paket; setelah kedaluwarsa link mati.
- Sender dapat email saat pertama dibuka dan saat dijawab.
- Log untuk pengirim: "👀 membuka halamanmu", "🎮 Kuis Kenal Aku · 2/2 benar", "🎮 Rencana Bareng · Pilih: …", "💚 <nama> jawab MAU (setelah 14x ngejar tombol Nggak)".
- Kartu gambar dihasilkan di klien; nama file wajar.

**5 Teknis**
- Route `/p/<panjang-acak>` (default) atau `/p/<slug-custom>` (Plus+); meta `noindex,nofollow`; tidak dilacak GA; OG minimal/generik agar tidak membocorkan isi.
- State progres tidak disimpan permanen (penerima bisa membuka ulang dari awal); event jawaban dikirim ke server untuk notifikasi.
- Gambar & audio diunggah ke storage; URL privat/bertanda tangan.

### 3.13 404

**1 Tampilan** — ilustrasi lucu, teks "halaman ini kabur" (nada bercanda), tombol kembali ke home / bikin halaman.
**2 Interaksi** — CTA → `/` atau `/buat`.
**3 Rasa** — konsisten playful, bukan pesan teknis.
**4–5** — status 404; halaman publik; noindex otomatis.

### 3.14 Cookie banner & pengaturan

**1 Tampilan** — kartu fixed bawah (region "Pengaturan cookie"), judul "🍪 BOLEH PAKAI COOKIE ANALITIK?", teks pendek (mobile) / lengkap (desktop: cookie login & pembayaran selalu aktif; analitik opsional; bukan iklan; halaman pribadi tidak dilacak), tombol "TOLAK" + "BOLEH", link Privasi.
**2 Interaksi** — pilih → banner hilang, pilihan tersimpan; bisa diubah lewat footer "Pengaturan cookie".
**3 Rasa** — jelas, tanpa dark pattern; menolak tetap bisa memakai semua fitur.
**4 Aturan bisnis** — consent disimpan (`proposigo-consent-v2` di referensi); analitik hanya jika diizinkan; halaman `/p/` dikecualikan.
**5 Teknis** — `localStorage`/cookie; region+label aksesibel; fokus keyboard.

### 3.15 Floating chat (referensi: "Si Malu · CS", AI)

**1 Tampilan** — bulatan lime 💬; panel nb-card: header avatar + "SI MALU · CS" + tombol tutup, sapaan, 6 chip pertanyaan cepat, input + "KIRIM", disclaimer "Tombol cepat dijawab otomatis; pesan bebas dijawab AI (OpenAI), bisa keliru. Jangan kirim password, OTP, atau data kartu." + link Privasi.
**2 Interaksi** — buka/tutup; chip langsung menjawab; input bebas → jawaban AI.
**3 Rasa** — ramah, cepat, jujur soal keterbatasan.

> **Divergensi wajib SuprizeGo:** jangan meniru AI/live chat. Tombol melayang membuka **panel kontak** dengan tautan `mailto:${CONTACT_EMAIL}`, judul "Butuh bantuan?", catatan "Dibalas lewat email, ya." tanpa janji respons instan.

---

## 4. Aturan bisnis (konsolidasi)

### 4.1 Paket & harga (terukur, ID)

| Paket | Harga | Masa aktif | Isi |
|---|---|---|---|
| **DASAR** — "Buat kejutan cepat" | Rp5.000 | 3 hari | Semua desain; musik bawaan; Main Berdua (1 permainan); Kartu QR; simpan jadi gambar; Ucapan bareng (10 teman); kapsul waktu ≤30 hari |
| **PLUS** — "Paling laris" | Rp10.000 | 14 hari | Semua isi Dasar; Main Berdua (2 permainan); bisa diedit lagi; voice note ≤1 menit; lagu pilihan (Spotify); link custom; Ucapan bareng (50); kapsul ≤90 hari |
| **ABADI** — "Kenangan selamanya" | Rp20.000 → **Rp15.000** (HEMAT 25%) | selamanya | Semua isi Plus; aktif selamanya; Main Berdua (3 permainan); tampil di Papan Abadi (opsional); desain eksklusif bertanda; Ucapan bareng (100); kapsul sampai 10 tahun |

Catatan: jarak harga efektif 5k → 10k → 15k, cocok dengan brief SuprizeGo (Basic Rp5.000). Tampilan harga ABADI memakai harga coret Rp20.000 sebagai anchor — **keputusan pemilik**: pertahankan anchor atau tampil Rp15.000 saja.

### 4.2 Batas konten
- Nama pengirim/penerima ≤40 karakter; pertanyaan besar ≤80; slug bebas (Plus+).
- Cerita 3–5 kartu, ≤180 karakter/kartu; surat ≤1500; foto ≤8 + caption; voice note ≤60 detik; Spotify (Plus+).
- Ucapan bareng: 10/50/100 teman; teman tanpa akun; bisa teks (+foto? belum terverifikasi).
- Kapsul waktu: halaman baru terbuka pada waktu yang dijadwalkan (≤30 hari / ≤90 hari / ≤10 tahun).
- Link: acak panjang & noindex (Dasar/Plus), custom (Plus+).
- Edit setelah bayar: Plus/Abadi.
- Kedaluwarsa: setelah masa aktif habis link tidak bisa dibuka; Abadi permanen.

### 4.3 Email (referensi)
- Ke pembeli: struk & info pembayaran; (mungkin) link halaman. 
- Ke pengirim: notifikasi saat halaman pertama kali dibuka; saat penerima menjawab (Mau/Nggak); saat rencana dipilih; ringkasan permainan.
- "Kabari aku" hari spesial: 1 email saat tema dibuka; berhenti via tautan di email (`/berhenti`).
- Pengirim email: transaksional (referensi memakai layanan pihak ketiga; SuprizeGo pilih nanti).

### 4.4 Pembayaran
- Sekali bayar, tanpa langganan/perpanjangan otomatis.
- ID/MY: IDR via DOKU — QRIS (tanpa biaya), e-wallet, VA (biaya admin bank).
- Luar ID/MY: USD via Lemon Squeezy — kartu, PayPal, Apple Pay, Google Pay.
- Mata uang ditentukan otomatis dari lokasi (IP).
- **SuprizeGo: gateway belum diputuskan — tanya pemilik sebelum implementasi; kunci di `.env`.**

### 4.5 Privasi & keamanan
- Halaman penerima: URL acak panjang, noindex, tidak dilacak analitik.
- Cookie: login & pembayaran esensial; analitik opt-in.
- Penerima tidak perlu akun; usia akun 13+.
- Foto/audio disimpan privat; akses lewat URL bertanda tangan (asumsi arsitektur; verifikasi di fase build).

---

## 5. Teknis terlihat (routing, param, SEO)

- **Bahasa:** default Indonesia; mirror `/en`; hreflang; toggle di footer.
- **Query param yang teramati:**
  - `?momen=<slug>` di `/buat`
  - `?hari=<slug>` / `/buat/rayakan?hari=<slug>` dari kartu hari
  - `?ref=seo-<audiens>`, `?ref=final` (atribusi)
  - `?ide=<slug>&n=<nomor>` deep link "Kirim ini"
  - `?next=%2Fdasbor` pada login
- **Link halaman:** `/p/<acak>`; Plus+ bisa `/p/<slug>`.
- **Meta:** title/description unik per halaman; OG 1200×630 per halaman; twitter card besar; theme-color lime; favicon set; canonical; `og:locale`.
- **robots.txt**: blokir area privat + bot AI; `Host`, `Sitemap`.
- **sitemap.xml**: hanya halaman publik.
- **llms.txt**: ringkasan produk & aturan.
- **localStorage teramati:**
  - `proposigo-consent-v2` = `granted` (consent)
  - `proposigo:draft:<momen>` = draft wizard
- **Status & error:** 404 kustom; rate-limit/429 muncul saat crawl agresif (bukan bagian UX).
- **Performa:** halaman home desktop ±6400px tinggi, mobile ±12500px (banyak animasi; perlu jaga LCP hero).

---

## 6. Pemetaan ke SuprizeGo (perbedaan yang diminta)

| Aspek | Referensi | SuprizeGo |
|---|---|---|
| Nama/merek | Proposigo | **SuprizeGo** (logo versi pemilik) |
| Kontak | chat AI + email internal | `CONTACT_EMAIL` (env) via panel kontak `mailto:`; tanpa janji live chat |
| Harga | 5k/10k/15k (anchor 20k) | **Rp5.000 / Rp10.000 / Rp15.000**, jarak sama; keputusan anchor menunggu pemilik |
| Copywriting | – | **ditulis ulang semua**, nada santai/playful Indonesia |
| Ilustrasi/logo | aset asli | **digambar sendiri**, gaya outline hitam tebal + warna datar |
| Navigasi | header + footer | sama; **tanpa hamburger**; toggle bahasa di footer |
| Demo home | playable | wajib playable, setara alur 8 bagian |
| Chat | AI | panel kontak email (jujur, tanpa AI) |
| Gateway | DOKU + Lemon Squeezy | **menunggu keputusan pemilik** |
| Analytics | GA opt-in | ikuti consent; halaman `/p/` dikecualikan |

### Keputusan terbuka (mohon konfirmasi)
1. **Gateway pembayaran** yang sudah dipakai pemilik (DOKU? Midtrans? Xendit? lainnya) + metode yang aktif untuk IDR.
2. **Anchor harga ABADI**: tampil "Rp20.000 → Rp15.000" atau "Rp15.000" langsung. (Nama paket Dasar/Plus/Abadi dan harga 5k/10k/15k **tidak diubah**.)
3. **Kebijakan refund** (referensi tidak menjelaskan; perlu teks resmi).
4. **Domain & email pengirim** untuk notifikasi (mis. `halo@…`), serta apakah notifikasi via Resend/Postmark.
5. **Analitik**: pakai GA4 (dengan consent) atau tanpa analitik dulu?
6. **Penyimpanan** foto/audio (S3/R2/Supabase) & database (Postgres/Supabase) — memengaruhi biaya; tanyakan sebelum menambah layanan berbayar.

---

## 7. Bukti riset (file di `.tmp/`)

- `ref-page-*.json`, `ref-page2-*.json` — dump DOM/teks semua halaman (desktop & mobile, ID & EN).
- `ref-play2-desktop.json`, `ref-close-desktop.json`, `ref-final3-closing.html` — alur penerima penuh + markup kartu akhir.
- `ref-price2-desktop.json` — kartu harga & bullet paket.
- `ref-form-ultah-d.json`, `ref-checkout-form.json` — wizard, batas field, draft key, drawer checkout.
- `ref-styles.json` — token & computed style komponen.
- `ref-cookie-settings.json`, `ref-chat.json`, `ref-faq-open.json` — banner cookie, panel chat, FAQ.
- `ref-dasbor.json` — login.
- `ref-sitemap.xml`, robots.txt, llms.txt — SEO & aturan.
- `ref2-home-m-0.png`, `ref-hover-primary.png`, screenshot lain — bukti visual.
