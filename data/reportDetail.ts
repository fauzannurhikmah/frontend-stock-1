export type NarasiProjection = {
  yr: string;
  val: string;
  grw: string;
  cls: "pos" | "neg" | "est";
};

export type NarasiFollowUp = {
  date: string;
  title: string;
  type: "confirm" | "revise" | "watch" | "alert";
  body: string[];
  metrics?: Array<{ lbl: string; val: string }>;
};

export type NarasiEntry = {
  headline: string;
  datePublished: string;
  body: string[];
  projections: NarasiProjection[];
  triggerConfirm: string[];
  triggerAlert: string[];
  followups: NarasiFollowUp[];
};

export type BandarmologyEntry = {
  foreign: number;
  domestic: number;
  retail: number;
  publi: number;
  trend: string;
  score: string;
  netBuy: string;
  brokers: Array<{
    name: string;
    buy: string;
    sell: string;
    net: string;
    pos: boolean;
  }>;
  signal: string[];
};

export type TechnicalEntry = {
  phase: number;
  phases: string[];
  desc: string;
  rsi: string;
  ma50: string;
  ma200: string;
  vol: string;
  analysis: string[];
  series: number[];
};

export const narasiData: Record<string, NarasiEntry> = {
  BBCA: {
    headline: "BBCA: Mesin Bunga Bersih yang Tidak Pernah Tidur",
    datePublished: "April 2026 - Ditulis oleh Andre Lukito & Steven Tjitra",
    body: [
      "Thesis inti BBCA bukan soal harga saham - tapi soal <strong>kekuatan struktural NIM (Net Interest Margin) yang konsisten di atas kompetitor</strong>. BBCA secara historis menjaga NIM di kisaran 5.5-6%, dua kali lipat rata-rata industri, berkat komposisi CASA (Current Account Savings Account) yang mencapai 79% dari total dana pihak ketiga. Artinya biaya dana BBCA sangat murah - dan margin bunganya sangat tebal.",
      "Ketika BI Rate turun, bank lain kehilangan margin karena bunga kredit turun tapi bunga deposito mereka tidak bisa ditekan lebih rendah. BBCA justru sebaliknya: karena CASA-nya dominan, biaya dananya tidak banyak berubah ketika suku bunga turun, sementara bunga kredit mereka tetap bisa bersaing. <strong>Inilah mengapa siklus rate cut adalah tailwind bagi BBCA, bukan headwind.</strong>",
      "Untuk proyeksi laba FY 2026, kami membangun model berbasis tiga asumsi: (1) kredit tumbuh 10-12% seiring pemulihan ekonomi dan ekspansi digital banking, (2) NIM stabil di 5.6-5.8% dengan manajemen CASA yang ketat, (3) cost-to-income ratio (CIR) sedikit meningkat akibat investasi digital tapi masih terkontrol di bawah 36%. Hasilnya: net income FY 2026 diproyeksikan tumbuh <strong>9-11% year-over-year ke kisaran Rp 57-59 triliun</strong>.",
      "Pada harga Rp 9.800, BBCA diperdagangkan di PBV 3.8x - masih di bawah rata-rata historis 5 tahun di 4.2x, dan jauh di bawah peak PBV 5.5x pada 2022. Valuasi ini memberikan margin of safety yang memadai untuk investor jangka panjang.",
    ],
    projections: [
      { yr: "FY 2024A", val: "Rp 54.0 T", grw: "+12%", cls: "pos" },
      { yr: "FY 2025A", val: "Rp 57.5 T", grw: "+6.5%", cls: "pos" },
      { yr: "FY 2026E", val: "Rp 62-64 T", grw: "+9-11%", cls: "est" },
      { yr: "FY 2027E", val: "Rp 68-72 T", grw: "+10-12%", cls: "est" },
    ],
    triggerConfirm: [
      "Net income Q1 2026 tumbuh >8% YoY - mengkonfirmasi trajectory FY 2026E",
      "NIM bertahan di atas 5.5% meskipun ada tekanan rate",
      "CASA ratio tetap di atas 75% - indikator kekuatan franchise",
      "Kredit tumbuh >10% tanpa kenaikan NPL signifikan",
    ],
    triggerAlert: [
      "NIM turun di bawah 5.3% - sinyal biaya dana meningkat",
      "NPL gross di atas 2.5% - kualitas aset memburuk",
      "Pertumbuhan kredit melambat di bawah 7% - demand melemah",
      "Regulator memperketat persyaratan CASA atau liquidity coverage",
    ],
    followups: [
      {
        date: "15 April 2026",
        title: "Rilis Q1 2026: Net income Rp 14.1 T - in-line dengan proyeksi",
        type: "confirm",
        body: [
          "BBCA melaporkan net income Q1 2026 sebesar Rp 14.1 triliun, tumbuh 8.9% YoY - selaras dengan proyeksi kami. NIM Q1 tercatat di 5.62%, sedikit lebih tinggi dari Q4 2025 (5.55%), mengkonfirmasi bahwa manajemen berhasil menjaga spread bahkan di tengah persaingan deposit yang intensif.",
          "CASA ratio tetap solid di 77.4%. Kredit tumbuh 11.2% YoY dengan NPL gross stabil di 1.8%. <strong>Tidak ada revisi thesis - trajectory FY 2026E Rp 62-64 T masih valid.</strong> Kami akan memonitor NIM di Q2 sebagai konfirmasi bahwa tren ini sustainable.",
        ],
        metrics: [
          { lbl: "Net Income Q1", val: "Rp 14.1 T" },
          { lbl: "Growth YoY", val: "+8.9%" },
          { lbl: "NIM Q1 2026", val: "5.62%" },
          { lbl: "CASA Ratio", val: "77.4%" },
          { lbl: "NPL Gross", val: "1.8%" },
          { lbl: "Status Thesis", val: "ON TRACK" },
        ],
      },
    ],
  },
  BMRI: {
    headline: "BMRI: ROE Turnaround yang Masih Diremehkan Pasar",
    datePublished: "Maret 2026 - Ditulis oleh Andre Lukito & Steven Tjitra",
    body: [
      "Bank Mandiri memulai dekade ini dengan beban warisan NPL yang tinggi dari portofolio korporasi era 2015-2018. Tapi narasi itu sudah usang. <strong>ROE BMRI telah meningkat dari 14% (2020) menjadi 22%+ (2025)</strong> - lompatan luar biasa yang belum sepenuhnya tercermin dalam valuasi saat ini.",
      "Kunci transformasi BMRI adalah dua hal yang berjalan bersamaan: program Livin by Mandiri yang berhasil menambah 30+ juta nasabah digital dalam tiga tahun, dan disiplin pengelolaan NPL yang menurunkan cost of credit dari 2.5% (2021) ke bawah 1.2% (2025). Kombinasi ini menghasilkan multiplier effect pada bottom line.",
      "Proyeksi kami untuk FY 2026: <strong>net income Rp 57-60 triliun, tumbuh 8-12% dari FY 2025</strong>. Driver utama adalah ekspansi kredit ke segmen UMKM melalui ekosistem digital, pemulihan fee income dari layanan transaksional, dan cost of credit yang tetap rendah di bawah 1.3%. Pada PBV 1.7x, BMRI masih sangat murah relatif terhadap profitabilitas yang sudah jauh membaik.",
    ],
    projections: [
      { yr: "FY 2024A", val: "Rp 55.8 T", grw: "+22%", cls: "pos" },
      { yr: "FY 2025A", val: "Rp 59.0 T", grw: "+5.7%", cls: "pos" },
      { yr: "FY 2026E", val: "Rp 63-66 T", grw: "+8-12%", cls: "est" },
      { yr: "FY 2027E", val: "Rp 70-75 T", grw: "+10-14%", cls: "est" },
    ],
    triggerConfirm: [
      "Net income Q1 2026 >Rp 14.5 T - tumbuh 8%+ YoY",
      "Cost of credit tetap di bawah 1.3%",
      "Livin MAU menembus 35 juta - ekosistem digital menguat",
    ],
    triggerAlert: [
      "NPL korporasi naik di atas 2.5% - warisan portofolio lama muncul kembali",
      "Net interest income tumbuh <5% - NIM tertekan lebih dari perkiraan",
    ],
    followups: [],
  },
  BBRI: {
    headline: "BBRI: Raja UMKM dengan Risiko Siklus yang Perlu Dipahami",
    datePublished: "Maret 2026 - Ditulis oleh Andre Lukito",
    body: [
      "BBRI adalah bank terbesar di Indonesia berdasarkan jumlah nasabah, dengan 80+ juta rekening dan jangkauan UMKM yang tidak tertandingi - termasuk 9.000+ unit kerja BRI hingga pelosok desa. <strong>Kekuatan BBRI adalah volume dan jangkauan, bukan margin.</strong> NIM BBRI sekitar 7.5% memang lebih tinggi dari bank besar lain, tapi itu merupakan kompensasi atas risiko kredit yang juga lebih tinggi di segmen mikro.",
      "Narasi FY 2026 berpusat pada satu pertanyaan: seberapa kuat pemulihan kualitas kredit di segmen mikro pasca restrukturisasi COVID? NPL BBRI sempat melonjak ke 3.7% pada 2022, dan telah turun ke ~2.8% di 2025. Proyeksi kami membutuhkan NPL untuk stabil di 2.5-2.8% agar net income bisa tumbuh double-digit.",
      "Jika asumsi kami benar - kredit mikro tumbuh 12%, NIM stabil, NPL terkontrol - <strong>net income FY 2026 diproyeksikan Rp 62-67 triliun</strong>. Ini adalah skenario base case dengan probabilitas 55%. Skenario bear (NPL naik ke 3.2%+) bisa memotong proyeksi hingga Rp 55-58 T.",
    ],
    projections: [
      { yr: "FY 2024A", val: "Rp 60.5 T", grw: "+3%", cls: "pos" },
      { yr: "FY 2025A", val: "Rp 62.0 T", grw: "+2.5%", cls: "pos" },
      { yr: "FY 2026E", val: "Rp 67-72 T", grw: "+8-16%", cls: "est" },
      { yr: "FY 2027E", val: "Rp 74-80 T", grw: "+10-15%", cls: "est" },
    ],
    triggerConfirm: [
      "NPL gross Q1 2026 turun ke bawah 2.7% - kualitas kredit mikro membaik",
      "Kredit mikro tumbuh >12% YoY",
    ],
    triggerAlert: [
      "NPL gross naik di atas 3.2% - siklus kredit mikro memburuk",
      "Pemerintah ubah skema KUR yang menekan margin BBRI",
    ],
    followups: [
      {
        date: "8 April 2026",
        title:
          "Preview Q1 2026: NPL mikro masih menekan, tapi ada tanda perbaikan",
        type: "watch",
        body: [
          "Berdasarkan data bank sentral per Februari 2026 dan update manajemen di conference call Maret, NPL gross BBRI diperkirakan bergerak di 2.85-2.95% untuk Q1 2026 - sedikit di atas target kami. Kredit mikro tumbuh kuat di 13.5% YoY, tapi kualitasnya masih perlu dikonfirmasi dari rilis resmi.",
          "<strong>Kami mempertahankan thesis tapi memperketat monitoring.</strong> Titik kritis yang perlu dilihat dari rilis Q1 penuh adalah angka NPL spesifik di segmen KUR dan angka CKPN (cost of credit). Jika CKPN naik di atas 1.8%, ada risiko revisi proyeksi ke bawah.",
        ],
        metrics: [
          { lbl: "NPL Est. Q1", val: "~2.9%" },
          { lbl: "Kredit Mikro Growth", val: "+13.5% YoY" },
          { lbl: "Status", val: "MONITORING" },
        ],
      },
    ],
  },
  TLKM: {
    headline: "TLKM: Dividend Play Tapi Attention Ke Margin Infrastruktur",
    datePublished: "Maret 2026 - Ditulis oleh Andre Lukito",
    body: [
      "Telkom Indonesia adalah kisah tentang <strong>transformasi dari voice/SMS ke broadband dan data center</strong> - transisi yang sudah 70% selesai tapi masih menyisakan tekanan margin di perjalanan. Telkomsel tetap menjadi mesin kas utama grup, dengan kontribusi >60% ke consolidated EBITDA.",
      "Narasi FY 2026 berpusat pada dua hal: (1) berapa cepat Indihome terus menambah pelanggan serat optik (target 10 juta home connected), dan (2) bagaimana profitabilitas segmen B2B/data center berkontribusi ke margin konsolidasi. Kami memproyeksikan revenue tumbuh 5-7% tapi net income tumbuh lebih lambat di 3-5% karena tekanan biaya jaringan.",
      "<strong>Proyeksi net income FY 2026: Rp 25-27 triliun</strong>, dengan dividend yield sekitar 5.5% pada harga saat ini - menjadikan TLKM menarik sebagai dividend play tapi kurang menarik sebagai growth play.",
    ],
    projections: [
      { yr: "FY 2024A", val: "Rp 24.6 T", grw: "-3%", cls: "neg" },
      { yr: "FY 2025A", val: "Rp 25.1 T", grw: "+2%", cls: "pos" },
      { yr: "FY 2026E", val: "Rp 26-28 T", grw: "+4-11%", cls: "est" },
      { yr: "FY 2027E", val: "Rp 28-31 T", grw: "+7-11%", cls: "est" },
    ],
    triggerConfirm: [
      "Indihome net adds Q1 2026 >400K - subscriber growth on track",
      "EBITDA margin konsolidasi naik ke atas 52%",
    ],
    triggerAlert: [
      "Churn Indihome meningkat >15% - kompetisi dari ISP lokal intensif",
      "Net income Q1 2026 tumbuh <2% YoY",
    ],
    followups: [],
  },
  ASII: {
    headline:
      "ASII: Portofolio Bisnis Luar Biasa Tapi Narasi EV Perlu Dipantau",
    datePublished: "Februari 2026 - Ditulis oleh Andre Lukito & Steven Tjitra",
    body: [
      "Astra International adalah konglomerat dengan 8 lini bisnis utama - tapi untuk 2026, dua hal yang paling menentukan adalah <strong>penjualan otomotif (55% revenue) dan pembiayaan/asuransi (kontributor margin terbesar)</strong>. Agribisnis dan alat berat adalah pelengkap yang menarik tapi bersifat siklikalitas tinggi.",
      "Narasi otomotif Astra untuk FY 2026 bergantung pada satu faktor makro: apakah konsumen kelas menengah Indonesia akan pulih dari tekanan daya beli 2024-2025? Data kredit kendaraan bermotor dari OJK per Q4 2025 menunjukkan pertumbuhan 8% YoY - tanda awal pemulihan. Jika tren ini berlanjut, <strong>volume penjualan kendaraan Astra bisa mencapai 580-600 ribu unit di FY 2026</strong>.",
      "Kami memproyeksikan <strong>net income konsolidasi FY 2026 di Rp 32-35 triliun</strong>, tumbuh 8-17% dari FY 2025. Valuasi pada PER 10x FY 2026E adalah discount signifikan terhadap kualitas portofolio bisnis ASII.",
    ],
    projections: [
      { yr: "FY 2024A", val: "Rp 30.0 T", grw: "-2%", cls: "neg" },
      { yr: "FY 2025A", val: "Rp 30.5 T", grw: "+1.7%", cls: "pos" },
      { yr: "FY 2026E", val: "Rp 33-36 T", grw: "+8-18%", cls: "est" },
      { yr: "FY 2027E", val: "Rp 36-40 T", grw: "+9-14%", cls: "est" },
    ],
    triggerConfirm: [
      "Volume penjualan kendaraan Q1 2026 >140 ribu unit - annualized 560+ K",
      "Margin bisnis pembiayaan stabil di atas 3.5%",
    ],
    triggerAlert: [
      "Penetrasi EV dari merek China menggerus market share Honda/Toyota secara signifikan",
      "Harga CPO turun di bawah MYR 3.500 - agribisnis tertekan",
    ],
    followups: [],
  },
};

export const bandarmologyData: Record<string, BandarmologyEntry> = {
  BBCA: {
    foreign: 42.2,
    domestic: 15.3,
    retail: 9.5,
    publi: 33.0,
    trend: "+1.2% asing 1bln",
    score: "Akumulasi",
    netBuy: "+Rp 485 M",
    brokers: [
      {
        name: "Morgan Stanley",
        buy: "1.250 M",
        sell: "820 M",
        net: "+430 M",
        pos: true,
      },
      {
        name: "Credit Suisse",
        buy: "980 M",
        sell: "650 M",
        net: "+330 M",
        pos: true,
      },
      {
        name: "Goldman Sachs",
        buy: "720 M",
        sell: "540 M",
        net: "+180 M",
        pos: true,
      },
      {
        name: "Mandiri Sekuritas",
        buy: "380 M",
        sell: "290 M",
        net: "+90 M",
        pos: true,
      },
      {
        name: "UBS Group",
        buy: "450 M",
        sell: "520 M",
        net: "-70 M",
        pos: false,
      },
      {
        name: "CLSA Limited",
        buy: "380 M",
        sell: "430 M",
        net: "-50 M",
        pos: false,
      },
    ],
    signal: [
      "Asing net buy konsisten selama 3 minggu berturut-turut - total Rp 1.2T dalam sebulan terakhir, mengindikasikan <strong>institutional accumulation</strong> yang signifikan.",
      "Morgan Stanley dan Credit Suisse menjadi dua broker terbesar yang aktif akumulasi - ini bukan broker spekulatif, melainkan prime broker global yang biasanya bergerak atas instruksi fund besar.",
      "<strong>Kepemilikan asing naik dari 41.0% ke 42.2%</strong> dalam 1 bulan - kenaikan 1.2% ini setara dengan pembelian ~Rp 15T ekuitas BBCA, angka yang sangat signifikan.",
      "Volume anomali terdeteksi pada 3 hari trading di minggu terakhir (volume 2.1-2.8x rata-rata) tanpa katalis berita yang jelas - sinyal klasik stealth accumulation.",
    ],
  },
  default: {
    foreign: 25.0,
    domestic: 35.0,
    retail: 20.0,
    publi: 20.0,
    trend: "Stabil",
    score: "Netral",
    netBuy: "-",
    brokers: [
      {
        name: "JP Morgan",
        buy: "250 M",
        sell: "220 M",
        net: "+30 M",
        pos: true,
      },
      {
        name: "Mandiri Sekuritas",
        buy: "180 M",
        sell: "160 M",
        net: "+20 M",
        pos: true,
      },
      {
        name: "BNI Sekuritas",
        buy: "120 M",
        sell: "140 M",
        net: "-20 M",
        pos: false,
      },
      {
        name: "CIMB Sekuritas",
        buy: "90 M",
        sell: "95 M",
        net: "-5 M",
        pos: false,
      },
    ],
    signal: [
      "Data bandarmology untuk emiten ini sedang dalam proses kompilasi tim riset Grove.",
      "Pantau broker summary harian melalui platform sekuritas Anda (MOST, Stockbit) untuk data terkini.",
      "Fokus pada net buy/sell dari broker asing (XX) dan broker institusi lokal (BMRI, BBNI, CIMB).",
      "Volume anomali (2x+ rata-rata tanpa berita) adalah leading indicator paling reliable untuk pergerakan jangka pendek.",
    ],
  },
};

export const technicalData: Record<string, TechnicalEntry> = {
  BBCA: {
    phase: 2,
    phases: [
      "Accumulation",
      "Markup",
      "Re-accumulation",
      "Markup II",
      "Distribution",
    ],
    desc: "Re-accumulation",
    rsi: "52",
    ma50: "Rp 9.450",
    ma200: "Rp 9.820",
    vol: "Rp 520 M/day",
    analysis: [
      "Harga membentuk pola flat base di kisaran Rp 9.200-10.000 selama 8 bulan - ciri khas fase <strong>Re-accumulation Wyckoff</strong>. Smart money sedang melakukan repositioning di level ini.",
      "Volume cenderung turun saat harga sideways (sign of strength) dan meningkat saat ada bounce - mengindikasikan tidak ada tekanan jual besar dari institusi.",
      "<strong>MA50 (Rp 9.450) masih di bawah MA200 (Rp 9.820)</strong> - Death Cross masih aktif, namun jarak mulai menyempit. Diperlukan konfirmasi Golden Cross sebelum entry optimal.",
      "RSI 52 di zona netral - belum overbought, memberikan ruang untuk naik. MACD crossover positif baru saja terbentuk di daily chart.",
      "Zona entry ideal: Rp 9.200-9.500 (demand zone). Target pertama Rp 10.400 (previous high). Stoploss closing di bawah Rp 8.900.",
    ],
    series: [
      9800, 9750, 9600, 9400, 9250, 9100, 9300, 9200, 9400, 9600, 9500, 9400,
      9600, 9700, 9800, 9750, 9900, 9800,
    ],
  },
  BMRI: {
    phase: 0,
    phases: ["Accumulation", "Test", "Spring", "Markup", "Distribution"],
    desc: "Accumulation",
    rsi: "47",
    ma50: "Rp 5.080",
    ma200: "Rp 5.620",
    vol: "Rp 380 M/day",
    analysis: [
      "BMRI berada dalam fase <strong>Accumulation Wyckoff</strong> - harga terkonsolidasi di range Rp 4.900-5.400 selama 6 bulan setelah koreksi tajam dari high Rp 7.675.",
      "Terdapat pola <strong>Selling Climax (SC)</strong> yang terkonfirmasi di area Rp 4.750 pada Okt 2024, diikuti Automatic Rally (AR) ke Rp 5.400. Ini struktur Wyckoff yang valid.",
      "<strong>Spring</strong> potensial teridentifikasi di Rp 4.900 - level ini ditembus sebentar kemudian bounce, mengindikasikan tidak ada supply tersisa di bawahnya.",
      "Volume anomali muncul di hari-hari tertentu ketika harga mendekati support Rp 5.000 - sinyal smart money melakukan akumulasi diam-diam.",
      "Konfirmasi markup dimulai: harga perlu menutup di atas Rp 5.400 dengan volume 1.5x rata-rata. Target fase markup pertama: Rp 6.200.",
    ],
    series: [
      6200, 5800, 5400, 5100, 4900, 4800, 4750, 4900, 5000, 5100, 5200, 5100,
      5050, 5150, 5200, 5100, 5300, 5200,
    ],
  },
  TLKM: {
    phase: 3,
    phases: ["Distribution", "Markdown", "Accumulation", "Test", "Recovery"],
    desc: "Markdown",
    rsi: "38",
    ma50: "Rp 3.280",
    ma200: "Rp 3.520",
    vol: "Rp 220 M/day",
    analysis: [
      "TLKM sedang dalam fase <strong>Markdown Wyckoff</strong> - tren turun jangka menengah masih aktif dengan lower highs dan lower lows yang konsisten.",
      "Harga saat ini (Rp 3.140) berada di bawah MA50 (Rp 3.280) dan MA200 (Rp 3.520) - double bearish confirmation.",
      "RSI 38 mendekati oversold tetapi di saham yang sedang downtrend, RSI bisa tetap rendah dalam waktu lama. Jangan counter-trend tanpa konfirmasi reversal.",
      "Tanda-tanda awal distribusi sudah terlihat sejak pertengahan 2024 - Upthrust After Distribution (UTAD) terjadi di Rp 4.000, kini diikuti supply pressure yang konsisten.",
      "<strong>Bagi long term investor</strong>: zona akumulasi potensial di Rp 2.800-3.000 jika harga turun ke sana. Bagi short/medium term: hindari entry, tunggu reversal signal.",
    ],
    series: [
      4000, 3800, 3600, 3400, 3300, 3200, 3300, 3150, 3100, 3200, 3150, 3100,
      3050, 3140, 3100, 3050, 3200, 3140,
    ],
  },
  default: {
    phase: 0,
    phases: ["Accumulation", "Markup", "Distribution", "Markdown", "Recovery"],
    desc: "Dalam Analisis",
    rsi: "50",
    ma50: "-",
    ma200: "-",
    vol: "-",
    analysis: [
      "Analisis teknikal Wyckoff untuk emiten ini sedang dalam proses penyusunan tim riset Grove.",
      "Gunakan data Key Statistics dan Analisis & Penilaian sebagai dasar keputusan sementara.",
      "Framework Wyckoff membutuhkan minimal 6 bulan data price action yang bersih untuk interpretasi yang valid.",
      "Pantau volume anomali sebagai leading indicator - lonjakan volume 2-3x rata-rata tanpa berita adalah signal awal pergerakan besar.",
      "Update analisis teknikal akan tersedia pada laporan riset berikutnya.",
    ],
    series: [
      100, 108, 112, 110, 106, 104, 109, 111, 115, 113, 118, 120, 117, 119, 123,
      121, 124, 122,
    ],
  },
};
