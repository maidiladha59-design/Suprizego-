import { isMomentId, type MomentId } from "./moments";
import type { SurprisePage } from "./types";

const EXAMPLES: Record<MomentId, SurprisePage> = {
  pengakuan: {
    slug: "k7m2p9q4v1n8t3r6",
    moment: "pengakuan",
    recipientName: "Nadia",
    senderName: "Raka",
    story:
      "Dua tahun aku menyimpan ini rapat-rapat. Dua tahun menertawakan ceritamu yang sebenarnya tidak lucu, menghafal lagu yang kamu sebut sekali, dan pura-pura sibuk setiap kali kamu lewat.\n\nAku tidak sedang mencari panggung. Aku hanya ingin akhirnya jujur: aku suka kamu. Bukan karena kamu sempurna, tapi karena bersamamu, hal-hal biasa terasa cukup.",
    letter:
      "Nadia,\n\naku tidak meminta jawaban hari ini. Aku cuma ingin kamu tahu bahwa perasaanku nyata dan sudah lama ada.\n\nKalau kamu mau, mari mulai dari secangkir kopi dan obrolan yang tidak terburu-buru. Kalau tidak, aku akan tetap menghargai setiap hal baik tentangmu — tanpa syarat.\n\n— Raka",
    photoUrls: [],
    games: [
      {
        id: "contoh-kuis-raka",
        type: "kuis",
        questions: [
          {
            id: "contoh-soal-minuman",
            text: "Minuman yang selalu aku pesan kalau kita nongkrong?",
            choices: [
              { id: "contoh-esteh", text: "Es teh manis", correct: true },
              { id: "contoh-kopisusu", text: "Kopi susu", correct: false },
              { id: "contoh-matcha", text: "Matcha latte", correct: false },
            ],
          },
          {
            id: "contoh-soal-tempat",
            text: "Pertama kali kita ngobrol lama, tempatnya di mana?",
            choices: [
              { id: "contoh-kantin", text: "Di kantin", correct: false },
              { id: "contoh-grup", text: "Di grup kelas", correct: true },
              { id: "contoh-perpus", text: "Di perpustakaan", correct: false },
            ],
          },
        ],
      },
      {
        id: "contoh-rencana-raka",
        type: "rencana",
        prompt: "Kalau kamu setuju, kencan pertama kita:",
        choices: [
          "Belanja di minimarket tengah malam",
          "Nonton film pilihanmu",
          "Jalan pagi cari sarapan",
        ],
      },
    ],
    musicUrl: null,
    activeUntil: null,
    isExample: true,
  },
  "ulang-tahun": {
    slug: "t3r8w1y6b4n9k2m5",
    moment: "ulang-tahun",
    recipientName: "Bima",
    senderName: "Keluarga",
    story:
      "Tujuh belas tahun lalu kamu lahir dan membuat rumah kami jauh lebih ramai. Sejak itu, tidak ada hari yang benar-benar sepi: ada tawa yang terlalu keras, sepatu yang berserakan, dan cerita panjang sebelum tidur.\n\nHari ini kamu menambah satu angka lagi. Kami ingin kamu tahu: semua hal yang kamu anggap biasa tentang dirimu — caramu peduli, caramu bertahan, caramu tetap ceria di hari yang berat — itu luar biasa.",
    letter:
      "Bima,\n\nselamat ulang tahun. Jangan buru-buru dewasa; nikmati saja setiap prosesnya. Kami akan selalu ada di barisan paling depan, menyoraki kamu, sesekali mengganggu, tapi tidak pernah pergi.\n\nSemoga tahun ini kamu dikelilingi hal-hal baik, orang-orang yang tulus, dan kesehatan yang tidak pernah kamu sadari betapa mahalnya.\n\n— Keluarga",
    photoUrls: [],
    musicUrl: null,
    activeUntil: null,
    isExample: true,
  },
  anniversary: {
    slug: "h5n8c2x7v3b9m4q1",
    moment: "anniversary",
    recipientName: "Ayu",
    senderName: "Dirga",
    story:
      "Tiga tahun. Banyak yang bilang waktu akan membuat semuanya biasa, tapi bersamamu, hal kecil tetap terasa baru: caramu menawar di pasar, caramu tertidur di perjalanan, caramu mengingat hal-hal yang bahkan aku lupa pernah kubilang.\n\nKita pernah bertengkar tentang hal sepele, diam beberapa jam, lalu rujuk lewat sepiring mie ayam. Mungkin itu rahasianya: kita tidak selalu setuju, tapi selalu memilih untuk kembali.",
    letter:
      "Ayu,\n\nterima kasih sudah bertahan, bukan hanya pada hari-hari yang mudah, tapi juga pada hari-hari yang membuat kita bertanya-tanya.\n\nAku tidak tahu kejutan apa yang menunggu kita tahun ini. Yang aku tahu, aku ingin menemukannya bersamamu — di warung yang sama, di hujan yang sama, di rumah yang nanti kita sebut milik kita.\n\n— Dirga",
    photoUrls: [],
    musicUrl: null,
    activeUntil: null,
    isExample: true,
  },
  "minta-maaf": {
    slug: "s9d4f7g2j6k1l8z3",
    moment: "minta-maaf",
    recipientName: "Sinta",
    senderName: "Adit",
    story:
      "Aku tahu kata maaf tidak otomatis menghapus semuanya. Aku tahu kamu masih mengingat hari itu: janji yang aku lupa, telepon yang tidak aku angkat, dan penjelasan yang aku sampaikan terlalu telat.\n\nAku tidak akan berdalih. Aku salah. Aku mengabaikan hal yang penting bagimu, dan itu tidak boleh terjadi lagi.\n\nHalaman ini bukan pengganti perbaikan. Ini awal — janji bahwa aku akan datang lebih tepat waktu, mendengar lebih dulu sebelum menjawab, dan memilih kamu saat pilihan itu sulit.",
    letter:
      "Sinta,\n\nmaaf untuk semua yang sudah kubuat terasa berat. Terima kasih karena masih membuka pintu untuk percakapan ini.\n\nAku tidak meminta kamu melupakan. Aku hanya berharap kita bisa berjalan lagi — pelan-pelan, lebih jujur, lebih hati-hati.\n\n— Adit",
    photoUrls: [],
    musicUrl: null,
    activeUntil: null,
    isExample: true,
  },
  wisuda: {
    slug: "z2x5c8v1b4n7m3q6",
    moment: "wisuda",
    recipientName: "Tyas",
    senderName: "Dimas",
    story:
      "Aku ingat malam-malam kamu masih menyalakan lampu belajar saat aku sudah tidur. Aku ingat laptop tua itu, tumpukan revisi, dan kopi yang selalu dingin sebelum diminum.\n\nHari ini kamu berdiri di panggung dengan toga. Semua lelah itu tidak hilang, tapi sekarang punya arti. Aku diam-diam selalu bangga, dan hari ini boleh bangga dengan suara keras.",
    letter:
      "Tyas,\n\nselamat wisuda. Ini bukan garis akhir, cuma panggung kecil sebelum petualangan yang lebih besar.\n\nKalau nanti kamu lelah, ingat: kamu sudah melewati hal-hal yang dulu terasa mustahil. Kamu boleh berhenti sejenak, tapi jangan lupa melanjutkan.\n\nAku akan selalu jadi adik yang paling berisik saat menyorakimu.\n\n— Dimas",
    photoUrls: [],
    musicUrl: null,
    activeUntil: null,
    isExample: true,
  },
};

export function getExample(moment: string): SurprisePage | null {
  if (!isMomentId(moment)) {
    return null;
  }
  return EXAMPLES[moment];
}
