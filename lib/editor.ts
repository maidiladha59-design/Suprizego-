import type { MomentId } from "@/lib/moments";

export type EditorDesign = {
  id: string;
  name: string;
  tagline: string;
  screen: string;
  chip: string;
  chipText: string;
  text: string;
  dots: readonly [string, string, string];
};

export type EditorConfig = {
  dateLabel: string;
  questionPlaceholder: string;
  stories: readonly string[];
  designs: readonly [EditorDesign, EditorDesign];
};

export const EDITOR_CONFIG: Record<MomentId, EditorConfig> = {
  pengakuan: {
    dateLabel: "Tanggal pertama kenal (opsional)",
    questionPlaceholder: "Mau jadi pacarku?",
    stories: [
      "Halo kamu. Aku mau jujur: tiap ketemu kamu, hari yang biasa aja jadi terasa lebih seru.",
      "Aku suka cara kamu ketawa, cara kamu cerita, bahkan cara kamu diem. Semuanya menarik.",
      "Kalau boleh, aku mau jadi orang yang kamu cari waktu senang atau capek.",
      "Nggak buru-buru kok. Aku cuma pengin kamu tahu, perasaan ini beneran ada.",
    ],
    designs: [
      {
        id: "permen",
        name: "Permen Pipi",
        tagline: "Manis, pink, deg-degan.",
        screen: "#FF8FB8",
        chip: "#FF6A3D",
        chipText: "#111111",
        text: "#111111",
        dots: ["#FFF4E0", "#B6F22E", "#FF6A3D"],
      },
      {
        id: "malam",
        name: "Chat Larut",
        tagline: "Obrolan larut bikin melek.",
        screen: "#111111",
        chip: "#B6F22E",
        chipText: "#111111",
        text: "#FFF4E0",
        dots: ["#FFF4E0", "#B6F22E", "#FF8FB8"],
      },
    ],
  },
  "ulang-tahun": {
    dateLabel: "Tanggal ulang tahun (opsional)",
    questionPlaceholder: "Apa harapanmu tahun ini?",
    stories: [
      "Selamat ulang tahun! Semoga tahun ini penuh hal baik yang datang tanpa harus kamu minta.",
      "Terima kasih sudah bertahan dan tumbuh sampai hari ini. Aku bangga banget sama kamu.",
      "Semoga mimpi kecilmu satu-satu jadi nyata. Pelan-pelan juga nggak apa-apa.",
      "Tarik napas, tiup lilinnya. Aku ikut doa yang sama: kamu bahagia terus.",
    ],
    designs: [
      {
        id: "konfeti",
        name: "Konfeti Ria",
        tagline: "Rame, cerah, penuh sorakan.",
        screen: "#B6F22E",
        chip: "#111111",
        chipText: "#FFF4E0",
        text: "#111111",
        dots: ["#111111", "#FFF4E0", "#FF8FB8"],
      },
      {
        id: "stroberi",
        name: "Kue Stroberi",
        tagline: "Manis seperti krim di atasnya.",
        screen: "#FFF4E0",
        chip: "#FF8FB8",
        chipText: "#111111",
        text: "#111111",
        dots: ["#FF8FB8", "#FF6A3D", "#B6F22E"],
      },
    ],
  },
  anniversary: {
    dateLabel: "Tanggal jadian (opsional)",
    questionPlaceholder: "Masih mau bareng aku?",
    stories: [
      "Sudah setahun, ya? Rasanya baru kemarin kita mulai cerita ini dari hal-hal receh.",
      "Terima kasih sudah stay saat aku menyenangkan, dan tetap tinggal saat aku nggak.",
      "Aku nggak janji sempurna. Tapi aku janji bakal terus belajar jadi tempat pulangmu.",
      "Mau lanjut jalan bareng lagi? Versi kita yang lebih santai dan lebih dewasa.",
    ],
    designs: [
      {
        id: "hati",
        name: "Hati Hangat",
        tagline: "Pink lembut buat cerita kalian.",
        screen: "#FF8FB8",
        chip: "#FFF4E0",
        chipText: "#111111",
        text: "#111111",
        dots: ["#FFF4E0", "#FF6A3D", "#B6F22E"],
      },
      {
        id: "senja",
        name: "Senja Jingga",
        tagline: "Hangat, kayak sore berdua.",
        screen: "#FF6A3D",
        chip: "#111111",
        chipText: "#FFF4E0",
        text: "#111111",
        dots: ["#FF6A3D", "#FFF4E0", "#111111"],
      },
    ],
  },
  "minta-maaf": {
    dateLabel: "Tanggal kejadian (opsional)",
    questionPlaceholder: "Maafkan aku, ya?",
    stories: [
      "Aku mau minta maaf. Bukan karena disuruh, tapi karena aku sadar aku yang bikin kamu capek.",
      "Aku sudah mikir panjang. Kamu nggak salah, aku yang terlalu cuek waktu itu.",
      "Nggak ada alasan yang cukup buat ngilang gitu aja. Aku khilaf dan aku nggak nyaman.",
      "Kalau kamu masih mau, aku mau dengerin semuanya. Pelan-pelan, sampai kamu lega.",
    ],
    designs: [
      {
        id: "langit",
        name: "Langit Teduh",
        tagline: "Tenang, pelan, menenangkan.",
        screen: "#FFF4E0",
        chip: "#B6F22E",
        chipText: "#111111",
        text: "#111111",
        dots: ["#B6F22E", "#FF8FB8", "#111111"],
      },
      {
        id: "hujan",
        name: "Malam Sunyi",
        tagline: "Gelap dan tenang, buat jujur.",
        screen: "#111111",
        chip: "#FFF4E0",
        chipText: "#111111",
        text: "#FFF4E0",
        dots: ["#FFF4E0", "#FF6A3D", "#FF8FB8"],
      },
    ],
  },
  wisuda: {
    dateLabel: "Tanggal wisuda (opsional)",
    questionPlaceholder: "Bangga nggak sama aku?",
    stories: [
      "Selamat wisuda! Capek, drama revisi, dan begadangnya akhirnya lunas juga.",
      "Aku inget waktu kamu hampir nyerah. Tapi lihat sekarang: toga di kepala, senyum di muka.",
      "Ini bukan garis akhir, ini gerbang buat hal-hal besar yang kamu incar dari dulu.",
      "Laptop boleh libur, kamu jangan. Sebentar aja, terus jalan lagi, ya.",
    ],
    designs: [
      {
        id: "toga",
        name: "Toga Hijau",
        tagline: "Lime segar buat hari kelulusan.",
        screen: "#B6F22E",
        chip: "#111111",
        chipText: "#FFF4E0",
        text: "#111111",
        dots: ["#111111", "#FFF4E0", "#FF8FB8"],
      },
      {
        id: "krem",
        name: "Kertas Krem",
        tagline: "Kayak ijazah yang baru dibuka.",
        screen: "#FFF4E0",
        chip: "#FF6A3D",
        chipText: "#111111",
        text: "#111111",
        dots: ["#FF6A3D", "#B6F22E", "#111111"],
      },
    ],
  },
};
