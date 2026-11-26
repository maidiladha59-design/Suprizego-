import { PLANS } from "./plans";

export type FaqItem = {
  question: string;
  answer: string;
};

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: "Apa itu SuprizeGo?",
    answer:
      "SuprizeGo adalah pembuat halaman kejutan interaktif. Kamu menulis cerita, menambahkan foto, musik, dan surat, lalu mengirimkannya sebagai satu link kepada orang tersayang.",
  },
  {
    question: "Perlu akun atau aplikasi?",
    answer:
      "Tidak. Penerima cukup membuka link di browser, baik di ponsel maupun komputer. Tidak ada unduhan dan tidak ada proses daftar.",
  },
  {
    question: "Berapa lama halaman aktif?",
    answer:
      `Tergantung paket yang dipilih: ${PLANS.map((plan) => `${plan.name} ${plan.activeLabel}`).join(", ")}. Setelah masa aktif berakhir, halaman tidak bisa dibuka lagi.`,
  },
  {
    question: "Bisa ditemukan di Google?",
    answer:
      "Tidak. Setiap halaman memakai kode tautan acak yang panjang dan ditandai noindex, sehingga tidak muncul di hasil mesin pencari. Hanya orang yang memegang link yang dapat membukanya.",
  },
  {
    question: "Cara kirim kejutan?",
    answer:
      "Salin link halamanmu, lalu kirim lewat WhatsApp, direct message, atau aplikasi pesan apa pun. Kamu juga bisa menuliskannya di kartu fisik.",
  },
  {
    question: "Untuk momen apa saja?",
    answer:
      "Saat ini ada lima momen: pengakuan, ulang tahun, anniversary, minta maaf, dan wisuda. Masing-masing punya suasana dan interaksi yang berbeda.",
  },
];
