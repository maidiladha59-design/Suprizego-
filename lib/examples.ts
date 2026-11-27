import { isMomentId, type MomentId } from "./moments";
import { isSpecialDayId, type SpecialDayId } from "./special-days";
import type { SurprisePage } from "./types";

const EXAMPLES: Record<MomentId, SurprisePage> = {
  pengakuan: {
    slug: "k7m2p9q4v1n8t3r6",
    moment: "pengakuan",
    recipientName: "Sekar",
    senderName: "Bima",
    story:
      "Dua tahun aku menyimpan ini rapat-rapat. Dua tahun menertawakan ceritamu yang sebenarnya tidak lucu, menghafal lagu yang kamu sebut sekali, dan pura-pura sibuk setiap kali kamu lewat.\n\nAku tidak sedang mencari panggung. Aku hanya ingin akhirnya jujur: aku suka kamu. Bukan karena kamu sempurna, tapi karena bersamamu, hal-hal biasa terasa cukup.",
    letter:
      "Sekar,\n\naku tidak meminta jawaban hari ini. Aku cuma ingin kamu tahu bahwa perasaanku nyata dan sudah lama ada.\n\nKalau kamu mau, mari mulai dari secangkir kopi dan obrolan yang tidak terburu-buru. Kalau tidak, aku akan tetap menghargai setiap hal baik tentangmu — tanpa syarat.\n\n— Bima",
    photoUrls: [],
    games: [
      {
        id: "contoh-kuis-bima",
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
        id: "contoh-rencana-bima",
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
    senderName: "Sekar",
    story:
      "Tujuh belas tahun lalu kamu lahir dan membuat rumah kita jauh lebih ramai. Sejak itu, tidak ada hari yang benar-benar sepi: ada tawa yang terlalu keras, sepatu yang berserakan, dan cerita panjang sebelum tidur.\n\nHari ini kamu menambah satu angka lagi. Aku ingin kamu tahu: semua hal yang kamu anggap biasa tentang dirimu — caramu peduli, caramu bertahan, caramu tetap ceria di hari yang berat — itu luar biasa.",
    letter:
      "Bima,\n\nselamat ulang tahun. Jangan buru-buru dewasa; nikmati saja setiap prosesnya. Aku akan selalu ada di barisan paling depan, menyorakimu, sesekali mengganggu, tapi tidak pernah pergi.\n\nSemoga tahun ini kamu dikelilingi hal-hal baik, orang-orang yang tulus, dan kesehatan yang tidak pernah kamu sadari betapa mahalnya.\n\n— Sekar",
    photoUrls: [],
    musicUrl: null,
    activeUntil: null,
    isExample: true,
  },
  anniversary: {
    slug: "h5n8c2x7v3b9m4q1",
    moment: "anniversary",
    recipientName: "Sekar",
    senderName: "Bima",
    story:
      "Tiga tahun. Banyak yang bilang waktu akan membuat semuanya biasa, tapi bersamamu, hal kecil tetap terasa baru: caramu menawar di pasar, caramu tertidur di perjalanan, caramu mengingat hal-hal yang bahkan aku lupa pernah kubilang.\n\nKita pernah bertengkar tentang hal sepele, diam beberapa jam, lalu rujuk lewat sepiring mie ayam. Mungkin itu rahasianya: kita tidak selalu setuju, tapi selalu memilih untuk kembali.",
    letter:
      "Sekar,\n\nterima kasih sudah bertahan, bukan hanya pada hari-hari yang mudah, tapi juga pada hari-hari yang membuat kita bertanya-tanya.\n\nAku tidak tahu kejutan apa yang menunggu kita tahun ini. Yang aku tahu, aku ingin menemukannya bersamamu — di warung yang sama, di hujan yang sama, di rumah yang nanti kita sebut milik kita.\n\n— Bima",
    photoUrls: [],
    musicUrl: null,
    activeUntil: null,
    isExample: true,
  },
  "minta-maaf": {
    slug: "s9d4f7g2j6k1l8z3",
    moment: "minta-maaf",
    recipientName: "Bima",
    senderName: "Sekar",
    story:
      "Aku tahu kata maaf tidak otomatis menghapus semuanya. Aku tahu kamu masih mengingat hari itu: janji yang aku lupa, telepon yang tidak aku angkat, dan penjelasan yang aku sampaikan terlalu telat.\n\nAku tidak akan berdalih. Aku salah. Aku mengabaikan hal yang penting bagimu, dan itu tidak boleh terjadi lagi.\n\nHalaman ini bukan pengganti perbaikan. Ini awal — janji bahwa aku akan datang lebih tepat waktu, mendengar lebih dulu sebelum menjawab, dan memilih kamu saat pilihan itu sulit.",
    letter:
      "Bima,\n\nmaaf untuk semua yang sudah kubuat terasa berat. Terima kasih karena masih membuka pintu untuk percakapan ini.\n\nAku tidak meminta kamu melupakan. Aku hanya berharap kita bisa berjalan lagi — pelan-pelan, lebih jujur, lebih hati-hati.\n\n— Sekar",
    photoUrls: [],
    musicUrl: null,
    activeUntil: null,
    isExample: true,
  },
  wisuda: {
    slug: "z2x5c8v1b4n7m3q6",
    moment: "wisuda",
    recipientName: "Bima",
    senderName: "Sekar",
    story:
      "Aku ingat malam-malam kamu masih menyalakan lampu belajar saat aku sudah tidur. Aku ingat laptop tua itu, tumpukan revisi, dan kopi yang selalu dingin sebelum diminum.\n\nHari ini kamu berdiri di panggung dengan toga. Semua lelah itu tidak hilang, tapi sekarang punya arti. Aku diam-diam selalu bangga, dan hari ini boleh bangga dengan suara keras.",
    letter:
      "Bima,\n\nselamat wisuda. Ini bukan garis akhir, cuma panggung kecil sebelum petualangan yang lebih besar.\n\nKalau nanti kamu lelah, ingat: kamu sudah melewati hal-hal yang dulu terasa mustahil. Kamu boleh berhenti sejenak, tapi jangan lupa melanjutkan.\n\nAku akan selalu jadi adik yang paling berisik saat menyorakimu.\n\n— Sekar",
    photoUrls: [],
    musicUrl: null,
    activeUntil: null,
    isExample: true,
  },
};

const SPECIAL_DAY_MESSAGES: Record<
  SpecialDayId,
  { story: string; letter: string }
> = {
  "hari-guru": {
    story:
      "Terima kasih untuk setiap kalimat yang kamu ulang dengan sabar, untuk setiap kesalahan yang tidak pernah membuatmu berhenti mengajar, dan untuk percaya pada kami bahkan ketika kami sendiri belum berani percaya.",
    letter:
      "Bima,\n\nsemoga kebaikanmu kembali kepadamu dalam banyak cara: lewat murid yang akhirnya paham, lewat rekan yang menghargai, dan lewat hari-hari yang tidak selalu melelahkan. Selamat Hari Guru.\n\n— Sekar",
  },
  valentine: {
    story:
      "Ada hal-hal kecil yang terus aku simpan: caramu menyapa sebelum aku sempat berkata, tawa yang membuat waktu terasa singkat, dan perhatian yang datang tanpa diminta. Hari ini aku ingin menyatakannya dengan jujur.",
    letter:
      "Bima,\n\naku suka berada di dekatmu. Bukan karena semua hari harus sempurna, tetapi karena bersamamu, hari biasa pun terasa layak diingat. Selamat Valentine.\n\n— Sekar",
  },
  imlek: {
    story:
      "Semoga rumah ini selalu dipenuhi suara tawa, meja yang penuh, dan kabar baik yang datang satu per satu. Terima kasih sudah menjadi bagian dari cerita yang ingin kujaga tetap hangat.",
    letter:
      "Bima,\n\nsemoga tahun ini membawa kesehatan, keberanian, dan pertemuan yang menyenangkan. Semoga setiap langkahmu diperlancar dan setiap harapanmu menemukan jalan.\n\n— Sekar",
  },
  lebaran: {
    story:
      "Perayaan terasa lebih lengkap ketika ada ruang untuk kembali, meminta maaf, dan duduk bersama. Semoga kita terus menjaga tali persaudaraan, bukan hanya saat hari raya tiba.",
    letter:
      "Bima,\n\nsemoga damai menemukan jalan ke rumahmu. Semoga maaf mudah diucapkan, semua yang jauh merasa dekat, dan kebaikan terus mengalir dari tanganmu.\n\n— Sekar",
  },
  halloween: {
    story:
      "Malam ini semua orang boleh memakai topeng, tapi aku tetap mengenalmu dari cara kamu tertawa. Siapkan satu cerita seru dan jangan lupa sisakan sedikit ruang untuk kejutan.",
    letter:
      "Bima,\n\nsemoga hal-hal yang membuatmu takut perlahan menjadi kecil. Tetap pilih hidup dengan berani, meski jalannya kadang gelap. Selamat Halloween.\n\n— Sekar",
  },
  natal: {
    story:
      "Semoga cahaya kecil di rumah ini mengingatkan kita bahwa harapan tidak harus besar untuk terasa hangat. Ada ruang untuk berbagi, memaafkan, dan memulai lagi.",
    letter:
      "Bima,\n\nsemoga Natal membawa ketenangan yang kamu butuhkan dan kebahagiaan sederhana yang bisa dibagi. Terima kasih sudah menjadi salah satu hal baik di tahun ini.\n\n— Sekar",
  },
  "tahun-baru": {
    story:
      "Tahun ini bukan tentang menjadi seseorang yang berbeda sepenuhnya. Ini tentang memilih langkah kecil yang lebih jujur, lebih berani, dan lebih dekat dengan hal yang kamu sayangi.",
    letter:
      "Bima,\n\nsemoga tahun baru membuka pintu-pintu yang selama ini kamu tunda. Jangan buru-buru; kita boleh tumbuh pelan-pelan sambil tetap menyimpan tawa.\n\n— Sekar",
  },
  "hari-ayah": {
    story:
      "Terima kasih untuk kekuatan yang sering tidak terlihat: pagi yang mulai lebih awal, beban yang dipikul diam-diam, dan doa yang tidak pernah berisik tetapi selalu utuh.",
    letter:
      "Bima,\n\nsemoga lelahmu selalu berakhir pada tempat yang hangat. Hari ini dan seterusnya, kamu layak mendapat istirahat, penghargaan, dan kasih sayang yang tidak diminta balasan.\n\n— Sekar",
  },
  "hari-ibu": {
    story:
      "Ada bentuk cinta yang hadir tanpa sorakan: nasihat yang diulang, kabar yang ditanyakan, dan ruang yang selalu terbuka. Semua itu tidak pernah terasa sepele.",
    letter:
      "Bima,\n\nsemoga kamu melihat dirimu dengan mata yang sama lembutnya seperti kamu melihat orang lain. Selamat Hari Ibu; terima kasih sudah menjaga banyak hal tanpa banyak bicara.\n\n— Sekar",
  },
  "hari-anak": {
    story:
      "Semoga rasa ingin tahu tidak pernah habis, keberanian untuk mencoba terus tumbuh, dan dunia tidak terlalu cepat mengambil alih imajinasimu.",
    letter:
      "Bima,\n\njangan lupa bermain, bertanya, dan membuat hal-hal kecil terasa besar. Selamat Hari Anak Nasional. Semoga dirimu yang paling riang selalu punya tempat.\n\n— Sekar",
  },
  kartini: {
    story:
      "Semoga setiap perempuan di sekitarmu punya ruang untuk memilih, berbicara, dan tumbuh tanpa harus meminta izin pada ketakutan. Perjuangan kecil hari ini adalah pintu untuk hari esok.",
    letter:
      "Bima,\n\nsemoga langkahmu tegas dan suaramu didengar. Teruslah menyalakan keberanian, bukan hanya untuk dirimu, tetapi juga untuk mereka yang masih mencari jalan.\n\n— Sekar",
  },
  hardiknas: {
    story:
      "Pendidikan bukan perlombaan untuk siapa yang paling cepat sampai. Ia adalah proses panjang untuk belajar melihat, bertanya, dan menjadi lebih bijak bersama.",
    letter:
      "Bima,\n\nsemoga setiap bab baru memberimu teman belajar yang baik dan keberanian untuk memulai lagi. Selamat Hari Pendidikan Nasional.\n\n— Sekar",
  },
  kemerdekaan: {
    story:
      "Kemerdekaan terasa nyata ketika kita berani berpikir, menjaga sesama, dan menggunakan kebebasan untuk hal yang membangun. Semangat ini sebaiknya hidup setiap hari.",
    letter:
      "Bima,\n\nsemoga kita terus merawat kebebasan dengan tanggung jawab. Jadilah bagian dari perubahan yang membuat lebih banyak orang bisa hidup layak.\n\n— Sekar",
  },
  batik: {
    story:
      "Setiap goresan membawa cerita, setiap warna menyimpan makna. Keindahan batik mengingatkan bahwa sesuatu yang dibuat dengan sabar akan memiliki kedalaman.",
    letter:
      "Bima,\n\nsemoga kamu terus menghargai akar tanpa berhenti membuat karya baru. Ada kebanggaan yang tumbuh ketika kita mau mempelajari dan melestarikannya.\n\n— Sekar",
  },
  "sumpah-pemuda": {
    story:
      "Perbedaan bukan alasan untuk menjauh. Justru di situlah kita belajar mendengar, bekerja bersama, dan menjaga satu ruang yang bisa disebut rumah.",
    letter:
      "Bima,\n\nsemoga persahabatan kita tidak hanya nyaman di hari baik, tetapi juga tangguh saat pendapat berbeda. Mari terus memilih dialog dan saling menjaga.\n\n— Sekar",
  },
  pahlawan: {
    story:
      "Keberanian tidak selalu datang dalam bentuk yang besar. Kadang ia hadir sebagai keteguhan kecil, keadilan yang dipilih, dan kebaikan yang tidak menunggu tepuk tangan.",
    letter:
      "Bima,\n\nsemoga kita mengenang para pahlawan dengan melakukan hal baik yang bisa dirasakan orang lain. Hormat tidak cukup diucapkan; ia perlu diwujudkan.\n\n— Sekar",
  },
  persahabatan: {
    story:
      "Persahabatan yang baik bukan tentang selalu bertemu, melainkan tentang masih saling mengerti setelah lama bercerita tentang hal yang berbeda-beda.",
    letter:
      "Bima,\n\nterima kasih sudah menjadi teman yang bisa menerima cerita panjang dan kabar singkat. Semoga kita tetap punya waktu untuk tertawa, berbagi, dan saling membantu.\n\n— Sekar",
  },
};

export function getSpecialDayExample(id: SpecialDayId): SurprisePage {
  const message = SPECIAL_DAY_MESSAGES[id];
  const moment: MomentId =
    id === "valentine" ? "pengakuan" : id === "hari-anak" ? "ulang-tahun" : "anniversary";

  return {
    slug: `contoh-${id}`,
    moment,
    recipientName: "Bima",
    senderName: "Sekar",
    story: message.story,
    letter: message.letter,
    photoUrls: [],
    games: [],
    musicUrl: null,
    specialDay: id,
    activeUntil: null,
    isExample: true,
  };
}

export function getExample(slug: string): SurprisePage | null {
  if (isSpecialDayId(slug)) {
    return getSpecialDayExample(slug);
  }
  if (!isMomentId(slug)) {
    return null;
  }
  return EXAMPLES[slug];
}
