"use client";

import { useMemo, useState, type ReactNode } from "react";

type ModuleCard = {
  id: number;
  kicker: string;
  title: string;
  desc: string;
  meta: string;
  tone: "grove" | "blue" | "gold" | "purple" | "red" | "green" | "base";
  icon: ReactNode;
  featured?: boolean;
};

type ModuleContent = {
  title: string;
  kicker: string;
  content: string;
};

type JournalEntry = {
  id: number;
  ticker: string;
  action: string;
  price: string;
  thesis: string;
  risk: string;
  date: string;
};

const moduleCards: ModuleCard[] = [
  {
    id: 0,
    kicker: "Modul 1 · Dasar",
    title: "Cara Membaca Laporan Grove",
    desc: "Panduan membaca probability framework, 5 skenario, tiga horizon waktu, dan cara menggunakan research score untuk keputusan.",
    meta: "15 menit · Pemula",
    tone: "grove",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#5FB88A"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    id: 1,
    kicker: "Modul 2 · Metode GROVE",
    title: "Metode GROVE · 5 Pilar Scoring",
    desc: "Memahami 5 pilar penilaian saham Grove: Growth, Relative Strength, Orientasi Tren, Volume & Volatility, Endorsement Smart Money · dan mengapa setiap pilar mengukur aspek yang berbeda.",
    meta: "25 menit · Core Grove",
    tone: "grove",
    featured: true,
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#5FB88A"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    ),
  },
  {
    id: 2,
    kicker: "Modul 3 · Fundamental",
    title: "Analisis Fundamental Saham",
    desc: "Cara membaca laporan keuangan, menghitung PE/PBV/EV-EBITDA, memahami margin, dan menilai kualitas bisnis secara sistematis.",
    meta: "25 menit · Intermediate",
    tone: "blue",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#3A9EE8"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3v18h18" />
        <path d="M7 14l3-3 3 3 5-5" />
      </svg>
    ),
  },
  {
    id: 3,
    kicker: "Modul 4 · Obligasi",
    title: "Memahami Obligasi & Yield",
    desc: "Hubungan inverse harga-yield, cara menghitung YTM, perbedaan FR vs INDON vs INDOIS, dan strategi entry berdasarkan siklus rate.",
    meta: "20 menit · Intermediate",
    tone: "gold",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#C8A84B"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18M8 14h3M8 17h8" />
      </svg>
    ),
  },
  {
    id: 4,
    kicker: "Modul 5 · Makro",
    title: "Siklus Makro & Rotasi Aset",
    desc: "Bagaimana siklus BI/Fed mempengaruhi tiap kelas aset, kapan rotasi dari saham ke obligasi dan sebaliknya, framework timing yang terukur.",
    meta: "30 menit · Advanced",
    tone: "purple",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#9A72E8"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
      </svg>
    ),
  },
  {
    id: 5,
    kicker: "Modul 6 · Psikologi",
    title: "Psikologi Investasi & Decision Journal",
    desc: "Menghindari FOMO dan panic selling, framework pre-mortem sebelum beli, cara membuat decision journal yang meningkatkan kualitas keputusan.",
    meta: "20 menit · Semua level",
    tone: "red",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#E04848"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    id: 6,
    kicker: "Modul 7 · Portfolio",
    title: "Membangun Portofolio Core-Satellite",
    desc: "Strategi core-satellite yang terbukti, cara DCA yang efektif, rebalancing berkala, dan membangun portofolio yang tahan volatilitas jangka panjang.",
    meta: "25 menit · Advanced",
    tone: "green",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#22C97A"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" />
      </svg>
    ),
  },
];

const moduleContent: ModuleContent[] = [
  {
    title: "Cara Membaca Laporan Grove",
    kicker: "Modul 1 · Dasar",
    content: `
      <div style="font-size:12.5px;color:var(--muted2);line-height:1.85">
      <p style="margin-bottom:12px">Setiap laporan Grove dibangun di atas satu keyakinan: <strong style="color:var(--text)">kualitas keputusan investasi harus diukur dari prosesnya, bukan dari hasilnya.</strong> Ini berbeda dari cara kebanyakan orang melihat investasi.</p>
      <div style="font-family:'Fraunces',serif;font-size:16px;font-weight:400;margin:16px 0 8px;color:var(--text)">1. Research Score (0-100)</div>
      <p style="margin-bottom:12px">Angka 0-100 yang merangkum kualitas keseluruhan thesis. Score 75+ = thesis sangat kuat dengan katalis konkret dan risiko teridentifikasi. Score 60-74 = menarik tapi ada ketidakpastian. Score di bawah 60 = speculative, butuh toleransi risiko tinggi.</p>
      <div style="font-family:'Fraunces',serif;font-size:16px;font-weight:400;margin:16px 0 8px;color:var(--text)">2. Probabilitas Positif & Negatif</div>
      <p style="margin-bottom:12px">Bukan prediksi. Ini adalah estimasi berapa persen kemungkinan return di atas 0% (positif) atau di bawah 0% (negatif) dalam horizon yang ditetapkan. Prob positif 70% bukan berarti "pasti naik" · artinya dalam 10 keputusan serupa, 7 akan berhasil dan 3 tidak.</p>
      <div style="font-family:'Fraunces',serif;font-size:16px;font-weight:400;margin:16px 0 8px;color:var(--text)">3. Expected Return (EV)</div>
      <p style="margin-bottom:12px">Expected return adalah rata-rata tertimbang dari semua skenario. EV +18% berarti jika kamu bisa mengulang keputusan ini 100 kali, rata-rata return-mu adalah +18% · meski individual bisa sangat berbeda. Ini adalah angka terpenting untuk keputusan jangka panjang.</p>
      <div style="font-family:'Fraunces',serif;font-size:16px;font-weight:400;margin:16px 0 8px;color:var(--text)">4. Tiga Horizon Waktu</div>
      <p style="margin-bottom:12px">Long Term (1-3 tahun) = untuk investor dengan tujuan wealth building. Medium Term (3-12 bulan) = untuk yang ingin ride katalis spesifik. Short Term (1-8 minggu) = trading setup, perlu toleransi volatilitas tinggi. Pilih horizon yang sesuai dengan situasimu, bukan yang expected return-nya paling besar.</p>
      <div style="background:var(--bg3);border-radius:var(--r2);padding:12px 14px;border-left:3px solid var(--grove);border-radius: 10px 0 0 10px;;margin-top:16px"><div style="font-size:10px;color:var(--grove);margin-bottom:4px">INGAT</div><div style="font-size:12px;color:var(--muted2)">Laporan Grove adalah alat bantu analisis, bukan sinyal beli/jual. Keputusan akhir selalu ada di tanganmu. Gunakan laporan ini sebagai salah satu input dalam framework keputusanmu, bukan satu-satunya.</div></div>
      </div>`,
  },
  {
    title: "Metode GROVE · 5 Pilar Scoring",
    kicker: "Modul 2 · Core Grove",
    content: `
      <div style="font-size:12.5px;color:var(--muted2);line-height:1.85">
      <p style="margin-bottom:12px">Setiap saham di dashboard Grove dinilai menggunakan <strong style="color:var(--text)">metode GROVE</strong> · 5 pilar yang masing-masing mengukur aspek berbeda dari sebuah saham. Namanya kami ambil dari huruf depan tiap pilar: <strong style="color:var(--grove)">G · R · O · V · E</strong>.</p>
      <p style="margin-bottom:16px">Metode ini mengadopsi prinsip dari tokoh investasi legendaris · <em>William J. O'Neil</em> (CAN SLIM) dan <em>Mark Minervini</em> (SEPA) · lalu diadaptasi untuk pasar Indonesia yang punya karakter khas: data bandarmology yang lebih detail daripada pasar AS, dan dinamika sektor yang lebih siklikal.</p>

      <div style="background:linear-gradient(135deg,rgba(95,184,138,0.05),var(--bg3));border:1px solid rgba(95,184,138,0.25);border-radius:var(--r2);padding:14px 16px;margin-bottom:16px; border-radius: 12px;">
        <div style="font-size:10px;color:var(--grove);letter-spacing:.12em;text-transform:uppercase;margin-bottom:6px;font-weight:500">Filosofi Dasar</div>
        <div style="font-size:12.5px;color:var(--text);line-height:1.75">Satu saham yang bagus harus <em style="color:var(--grove)">kuat di semua aspek secara bersamaan</em> · fundamental solid, leader di pasar, trennya naik, likuid dengan volatilitas sehat, dan diakumulasi smart money. Skor tinggi hanya di satu pilar bukan tanda bagus.</div>
      </div>

      <div style="font-family:'Fraunces',serif;font-size:17px;font-weight:400;margin:18px 0 10px;color:var(--text)">Pilar 1 · G · Growth Earnings</div>
      <p style="margin-bottom:10px">Mengukur apakah bisnis ini <strong style="color:var(--text)">berkualitas dan sedang tumbuh</strong>. Menggabungkan dua pertanyaan:</p>
      <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px">
        <div style="background:var(--bg3);border-radius:var(--r);padding:8px 12px;border-radius: 12px;"><strong style="color:var(--text)">Backward (track record) ·</strong> konsistensi EPS tahunan 3 tahun, ROE TTM. Bisnis yang sudah membuktikan diri.</div>
        <div style="background:var(--bg3);border-radius:var(--r);padding:8px 12px;border-radius: 8px;"><strong style="color:var(--text)">Forward (masa depan) ·</strong> pertumbuhan EPS kuartal terbaru, revenue growth, perubahan konsensus analis, tren net profit margin. Sinyal bahwa bisnis sedang akselerasi.</div>
      </div>
      <p style="margin-bottom:16px">Bobot forward lebih besar daripada backward, karena <strong style="color:var(--text)">harga saham merespon ekspektasi masa depan</strong>, bukan sekadar laporan lampau. Perusahaan yang fundamentalnya membaik tapi historisnya biasa-biasa saja bisa dapat skor G tinggi · itu yang menangkap <em>inflection point</em>.</p>

      <div style="font-family:'Fraunces',serif;font-size:17px;font-weight:400;margin:18px 0 10px;color:var(--text)">Pilar 2 · R · Relative Strength</div>
      <p style="margin-bottom:10px">Mengukur apakah saham ini <strong style="color:var(--text)">leader atau laggard</strong> · bukan vs IHSG saja, tapi vs seluruh saham di universe Grove. Mengadopsi formula RS O'Neil yang legendaris:</p>
      <div style="background:var(--bg3);border-radius:var(--r2);padding:12px 14px;margin-bottom:12px;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted3);line-height:1.7;border-radius: 12px;">
        RS = performa saham relatif vs 3, 6, 9, 12 bulan terakhir<br>
        · Peringkat percentile vs seluruh saham · Skala 0-99<br>
        <span style="color:var(--grove)">RS 90 = outperform 90% saham lain di pasar</span>
      </div>
      <p style="margin-bottom:16px"><strong style="color:var(--text)">Mengapa penting?</strong> Saham yang sudah menjadi leader cenderung tetap leader. Winner keeps winning · ini empirical truth yang terbukti di puluhan riset akademis. Pilar R secara otomatis juga <em>menyerap efek makro yang sudah tercermin di harga</em> · sektor yang diuntungkan makro akan memiliki RS tinggi.</p>

      <div style="font-family:'Fraunces',serif;font-size:17px;font-weight:400;margin:18px 0 10px;color:var(--text)">Pilar 3 · O · Orientasi Tren</div>
      <p style="margin-bottom:10px">Mengukur <strong style="color:var(--text)">struktur tren harga</strong> menggunakan framework Stage Analysis (Weinstein) dan VCP (Minervini). Mencari saham di <em>Stage 2 Advancing</em> · fase di mana smart money sudah masuk dan harga mulai mark up secara terstruktur.</p>
      <div style="background:var(--bg3);border-radius:var(--r2);padding:12px 14px;margin-bottom:12px;border-radius: 12px;">
        <div style="font-size:10px;color:var(--grove);margin-bottom:6px;letter-spacing:.08em;text-transform:uppercase">Komponen Kunci</div>
        <div style="font-size:12px;color:var(--muted3);line-height:1.7">· Posisi harga terhadap MA 50/150/200<br>· Alignment MA (50 &gt; 150 &gt; 200 = uptrend sehat)<br>· Slope MA200 (durasi kenaikan tren utama)<br>· VCP pattern (volatility contraction sebelum breakout)<br>· Volume confirmation (volume naik saat harga naik)</div>
      </div>
      <p style="margin-bottom:16px">Saham di Stage 2 dengan VCP pattern yang matang memiliki probabilitas breakout tertinggi · inilah pattern yang Minervini sebut sebagai <em>sweet spot</em> untuk entry momentum.</p>

      <div style="font-family:'Fraunces',serif;font-size:17px;font-weight:400;margin:18px 0 10px;color:var(--text)">Pilar 4 · V · Volume & Volatility</div>
      <p style="margin-bottom:10px">Mengukur <strong style="color:var(--text)">kualitas pergerakan dan eksekusi</strong>. Bukan sekadar volume absolut · tapi karakter volatilitas.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
        <div style="background:var(--bg3);border-radius:var(--r);padding:10px 12px;border-radius: 12px;"><div style="font-size:10px;color:var(--grove);margin-bottom:4px">Likuiditas</div><div style="font-size:11.5px">Volume transaksi harian yang cukup untuk masuk-keluar tanpa slippage besar. Saham likuid = lebih mudah di-manage.</div></div>
        <div style="background:var(--bg3);border-radius:var(--r);padding:10px 12px;border-radius: 12px;"><div style="font-size:10px;color:var(--grove);margin-bottom:4px">Capture Ratio</div><div style="font-size:11.5px">Membedakan "beta bagus" (naik lebih tinggi saat market naik) dari "beta buruk" (turun lebih dalam saat market turun).</div></div>
      </div>
      <p style="margin-bottom:16px"><strong style="color:var(--text)">Insight penting:</strong> Saham multibagger sejati menunjukkan <em>asymmetric capture</em> · naik lebih kuat saat market naik, tapi turun <em>lebih sedikit</em> saat market koreksi. Saham dengan beta tinggi di kedua arah justru adalah <em>widow-maker</em> yang berbahaya untuk cut loss.</p>

      <div style="font-family:'Fraunces',serif;font-size:17px;font-weight:400;margin:18px 0 10px;color:var(--text)">Pilar 5 · E · Endorsement Smart Money</div>
      <p style="margin-bottom:10px">Mengukur <strong style="color:var(--text)">siapa yang sedang membeli atau menjual saham ini</strong>. Istilah "smart money" di sini tidak terbatas pada asing saja · termasuk institusi domestik dan bandar:</p>
      <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px">
        <div style="background:var(--bg3);border-radius:var(--r);padding:8px 12px;border-radius: 12px;"><strong style="color:var(--text)">Net flow asing</strong> · akumulasi atau distribusi oleh investor luar negeri 3 bulan terakhir</div>
        <div style="background:var(--bg3);border-radius:var(--r);padding:8px 12px;border-radius: 12px;"><strong style="color:var(--text)">Net flow broker institusi domestik</strong> · Mandiri Sek, BRI Dan, BNI Sek, UBS, Mirae, dll</div>
        <div style="background:var(--bg3);border-radius:var(--r);padding:8px 12px;border-radius: 12px;"><strong style="color:var(--text)">A/D Ratio</strong> · perbandingan hari akumulasi vs distribusi dalam 25 hari (footprint bandar)</div>
        <div style="background:var(--bg3);border-radius:var(--r);padding:8px 12px;border-radius: 12px;"><strong style="color:var(--text)">Tren kepemilikan institusi</strong> · apakah ownership institusi naik atau turun dari kuartal ke kuartal</div>
      </div>
      <p style="margin-bottom:16px">Pilar ini adalah <em>keunggulan Grove di pasar Indonesia</em> · data bandarmology detail yang tidak tersedia di pasar AS. O'Neil hanya bisa lihat "institutional ownership %" dari laporan mutual fund. Di IHSG kita bisa lihat broker-by-broker flow harian. <strong style="color:var(--text)">Ini edge yang kami manfaatkan.</strong></p>

      <div style="font-family:'Fraunces',serif;font-size:17px;font-weight:400;margin:20px 0 10px;color:var(--text)">3 Horizon · Satu Saham, Tiga Perspektif</div>
      <p style="margin-bottom:12px">Setiap saham di Grove dinilai untuk tiga jangka waktu berbeda karena <strong style="color:var(--text)">saham yang sama bisa menjadi pilihan berbeda tergantung horizon-mu</strong>:</p>
      <div style="display:grid;grid-template-columns:1fr;gap:8px;margin-bottom:12px">
        <div style="background:var(--bg3);border-radius:var(--r);padding:10px 14px;border-left:3px solid var(--grove);border-radius: 10px 0 0 10px"><div style="font-size:11px;color:var(--grove);font-weight:500;margin-bottom:3px">Long Term · 1-3 tahun</div><div style="font-size:12px;color:var(--muted3);line-height:1.7">Fundamental (G) paling dominan. Kamu beli kualitas bisnis, hold bertahun-tahun. Teknikal & flow relevan tapi tidak penentu.</div></div>
        <div style="background:var(--bg3);border-radius:var(--r);padding:10px 14px;border-left:3px solid var(--amber);border-radius: 10px 0 0 10px"><div style="font-size:11px;color:var(--amber);font-weight:500;margin-bottom:3px">Medium Term · 3-12 bulan</div><div style="font-size:12px;color:var(--muted3);line-height:1.7">Seimbang · fundamental tetap penting, tapi teknikal dan flow mulai menentukan <em>timing</em> entry.</div></div>
        <div style="background:var(--bg3);border-radius:var(--r);padding:10px 14px;border-left:3px solid var(--red);border-radius: 10px 0 0 10px"><div style="font-size:11px;color:var(--red);font-weight:500;margin-bottom:3px">Short Term · 1-8 minggu</div><div style="font-size:12px;color:var(--muted3);line-height:1.7">Teknikal & flow dominan. Fundamental hanya sebagai <em>quality filter</em>. Yang menggerakkan harga adalah momentum dan sentiment.</div></div>
      </div>

      <p style="margin-bottom:16px"><strong style="color:var(--text)">Contoh nyata ·</strong> saham momentum dengan fundamental belum proven bisa mendapat skor Short Term tinggi (Leader Utama), tapi Long Term rendah (Watchlist). Ini informasi penting: jangan hold saham itu 3 tahun, tapi bisa jadi setup menarik untuk 4-8 minggu dengan stop-loss disiplin.</p>

      <div style="font-family:'Fraunces',serif;font-size:17px;font-weight:400;margin:20px 0 10px;color:var(--text)">Band Keputusan</div>
      <p style="margin-bottom:10px">Skor Grove dipetakan ke 5 band untuk memudahkan interpretasi:</p>
      <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px">
        <div style="background:rgba(34,201,122,0.08);border:1px solid rgba(34,201,122,0.25);border-radius:var(--r);padding:8px 12px;display:flex;justify-content:space-between;align-items:center;border-radius: 12px;"><span><strong style="color:#22C97A">85-100</strong> · Leader Utama</span><span style="font-size:11px;color:var(--muted2)">Beli dengan conviction tinggi</span></div>
        <div style="background:rgba(95,184,138,0.05);border:1px solid rgba(95,184,138,0.2);border-radius:var(--r);padding:8px 12px;display:flex;justify-content:space-between;align-items:center;border-radius: 12px;"><span><strong style="color:var(--grove)">75-84</strong> · Beli Saat Setup</span><span style="font-size:11px;color:var(--muted2)">Entry bertahap</span></div>
        <div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--r);padding:8px 12px;display:flex;justify-content:space-between;align-items:center;border-radius: 12px;"><span><strong style="color:var(--muted3)">60-74</strong> · Watchlist</span><span style="font-size:11px;color:var(--muted2)">Pantau, belum entry</span></div>
        <div style="background:rgba(224,164,68,0.05);border:1px solid rgba(224,164,68,0.2);border-radius:var(--r);padding:8px 12px;display:flex;justify-content:space-between;align-items:center;border-radius: 12px;"><span><strong style="color:var(--amber)">45-59</strong> · Belum Momentum</span><span style="font-size:11px;color:var(--muted2)">Skip, tidak ada setup</span></div>
        <div style="background:rgba(224,72,72,0.05);border:1px solid rgba(224,72,72,0.2);border-radius:var(--r);padding:8px 12px;display:flex;justify-content:space-between;align-items:center;border-radius: 12px;"><span><strong style="color:var(--red)">0-44</strong> · Hindari</span><span style="font-size:11px;color:var(--muted2)">Tidak layak beli</span></div>
      </div>

      <div style="background:var(--bg3);border-radius:var(--r2);padding:12px 14px;border-left:3px solid var(--grove);border-radius: 10px 0 0 10px;;margin-top:16px"><div style="font-size:10px;color:var(--grove);margin-bottom:4px">PRINSIP GROVE</div><div style="font-size:12px;color:var(--muted2)">GROVE Score adalah alat bantu · bukan sinyal beli/jual otomatis. Lima pilar memberikan <em>peta lengkap</em> tentang karakter saham, tapi keputusan akhir tetap di tanganmu. Gunakan skor untuk <em>memahami mengapa</em>, bukan sekedar <em>membeli karena skor tinggi</em>.</div></div>
      </div>`,
  },
  {
    title: "Analisis Fundamental Saham",
    kicker: "Modul 3 · Fundamental",
    content: `
      <div style="font-size:12.5px;color:var(--muted2);line-height:1.85">
      <p style="margin-bottom:12px">Analisis fundamental menjawab satu pertanyaan: <strong style="color:var(--text)">apakah bisnis ini berkualitas tinggi dan apakah harganya wajar?</strong> Dua pertanyaan berbeda yang sering dicampur.</p>
      <div style="font-family:'Fraunces',serif;font-size:16px;font-weight:400;margin:16px 0 8px;color:var(--text)">Kualitas Bisnis · 4 Metrik Kunci</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
        <div style="background:var(--bg3);border-radius:var(--r);padding:10px 12px;border-radius: 12px;"><div style="font-size:10px;color:var(--grove);margin-bottom:4px">ROE (Return on Equity)</div><div style="font-size:11.5px">Target: >15%. ROE tinggi = manajemen efisien menggunakan modal pemegang saham.</div></div>
        <div style="background:var(--bg3);border-radius:var(--r);padding:10px 12px;border-radius: 12px;"><div style="font-size:10px;color:var(--grove);margin-bottom:4px">Net Profit Margin</div><div style="font-size:11.5px">Target: konsisten dan stabil. Margin yang naik = pricing power atau efisiensi.</div></div>
        <div style="background:var(--bg3);border-radius:var(--r);padding:10px 12px;border-radius: 12px;"><div style="font-size:10px;color:var(--grove);margin-bottom:4px">Revenue Growth</div><div style="font-size:11.5px">Target: pertumbuhan konsisten >10%/tahun selama 3-5 tahun. Jangan lihat 1 tahun saja.</div></div>
        <div style="background:var(--bg3);border-radius:var(--r);padding:10px 12px;border-radius: 12px;"><div style="font-size:10px;color:var(--grove);margin-bottom:4px">Debt-to-Equity</div><div style="font-size:11.5px">Target: &lt;1.0x untuk non-bank. DER tinggi = rentan saat suku bunga naik.</div></div>
      </div>
      <div style="font-family:'Fraunces',serif;font-size:16px;font-weight:400;margin:16px 0 8px;color:var(--text)">Valuasi · Berapa yang Layak Dibayar?</div>
      <p style="margin-bottom:8px"><strong style="color:var(--text)">PE Ratio</strong> · Harga dibagi EPS. PE 15x berarti kamu bayar 15 tahun earnings. Bandingkan dengan PE historis saham tersebut, bukan PE pasar secara umum.</p>
      <p style="margin-bottom:8px"><strong style="color:var(--text)">PBV (Price-to-Book Value)</strong> · Relevan untuk perbankan. PBV di bawah rata-rata historis = saham murah relatif.</p>
      <p style="margin-bottom:12px"><strong style="color:var(--text)">EV/EBITDA</strong> · Untuk perbandingan lintas sektor. Mengabaikan pengaruh utang dan pajak sehingga lebih apple-to-apple.</p>
      <div style="background:var(--bg3);border-radius:var(--r2);padding:12px 14px;border-left:3px solid var(--amber);border-radius: 10px 0 0 10px"><div style="font-size:10px;color:var(--amber);margin-bottom:4px">PERANGKAP UMUM</div><div style="font-size:12px;color:var(--muted2)">Bisnis bagus · saham bagus untuk dibeli sekarang. BBCA adalah bisnis terbaik di Indonesia, tapi jika PE-nya 40x sementara historis 25x, kamu mungkin overpay. Selalu hubungkan kualitas bisnis dengan valuasi relatif.</div></div>
      </div>`,
  },
  {
    title: "Memahami Obligasi & Yield",
    kicker: "Modul 4 · Obligasi",
    content: `
      <div style="font-size:12.5px;color:var(--muted2);line-height:1.85">
      <p style="margin-bottom:12px">Obligasi adalah instrumen yang paling disalahpahami investor ritel Indonesia. Padahal ini adalah salah satu instrumen paling powerful · terutama jika timed dengan benar di siklus rate.</p>
      <div style="font-family:'Fraunces',serif;font-size:16px;font-weight:400;margin:16px 0 8px;color:var(--text)">Hubungan Inverse Yield-Harga (Paling Penting)</div>
      <div style="background:var(--bg3);border-radius:var(--r2);padding:14px;margin-bottom:12px;display:grid;grid-template-columns:1fr 1fr;gap:12px;text-align:center;border-radius: 12px;">
        <div style="border:1px solid rgba(34,201,122,.3);border-radius:var(--r);padding:10px;border-radius: 10px;"><div style="font-size:20px;font-weight:500;color:var(--green);margin-bottom:4px">Yield ·</div><div style="font-size:20px;font-weight:500;color:var(--red);margin-bottom:6px">Harga ·</div><div style="font-size:10px;color:var(--muted)">Saat BI naikan suku bunga</div></div>
        <div style="border:1px solid rgba(95,184,138,.3);border-radius:var(--r);padding:10px;border-radius: 10px;"><div style="font-size:20px;font-weight:500;color:var(--red);margin-bottom:4px">Yield ·</div><div style="font-size:20px;font-weight:500;color:var(--green);margin-bottom:6px">Harga ·</div><div style="font-size:10px;color:var(--muted)">Saat BI turunkan suku bunga</div></div>
      </div>
      <p style="margin-bottom:12px"><strong style="color:var(--text)">Implikasi praktis:</strong> Jika kamu beli FR100 saat yield 7% (harga rendah), dan BI kemudian cut rate sehingga yield turun ke 6%, harga obligasimu naik. Kamu dapat: kupon 6.625% + capital gain dari kenaikan harga.</p>
      <div style="font-family:'Fraunces',serif;font-size:16px;font-weight:400;margin:16px 0 8px;color:var(--text)">3 Sumber Return Obligasi</div>
      <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px">
        <div style="background:var(--bg3);border-radius:var(--r);padding:8px 12px;display:flex;align-items:center;gap:10px;border-radius: 12px;"><span style="font-size:16px;font-weight:500;color:var(--gold);min-width:24px">1</span><div><strong style="color:var(--text)">Kupon (fixed)</strong> · Pendapatan tetap yang masuk rekening setiap bulan/semester</div></div>
        <div style="background:var(--bg3);border-radius:var(--r);padding:8px 12px;display:flex;align-items:center;gap:10px;border-radius: 12px;"><span style="font-size:16px;font-weight:500;color:var(--gold);min-width:24px">2</span><div><strong style="color:var(--text)">Capital gain</strong> · Jika yield turun · harga naik · kamu bisa jual lebih tinggi dari harga beli</div></div>
        <div style="background:var(--bg3);border-radius:var(--r);padding:8px 12px;display:flex;align-items:center;gap:10px;border-radius: 12px;"><span style="font-size:16px;font-weight:500;color:var(--gold);min-width:24px">3</span><div><strong style="color:var(--text)">FX gain (INDON/INDOIS)</strong> · Jika USD menguat vs IDR, nilai portofolio USD-mu dalam IDR naik</div></div>
      </div>
      <div style="background:var(--bg3);border-radius:var(--r2);padding:12px 14px;border-left:3px solid var(--grove);border-radius: 10px 0 0 10px;"><div style="font-size:10px;color:var(--grove);margin-bottom:4px">STRATEGI ENTRY TERBAIK</div><div style="font-size:12px;color:var(--muted2)">Entry obligasi paling optimal adalah saat yield spike (harga turun) dan BI masih dalam fase tightening atau hold. Saat BI mulai cut, harga obligasi naik dan kamu mendapat capital gain di atas kupon. Ini adalah setup yang Grove identifikasi di FR100 saat ini.</div></div>
      </div>`,
  },
  {
    title: "Siklus Makro & Rotasi Aset",
    kicker: "Modul 5 · Makro",
    content: `
      <div style="font-size:12.5px;color:var(--muted2);line-height:1.85">
      <p style="margin-bottom:12px">Rotasi aset adalah strategi menggeser alokasi portofolio berdasarkan posisi siklus ekonomi · bukan market timing, tapi <strong style="color:var(--text)">probabilistic positioning</strong>.</p>
      <div style="font-family:'Fraunces',serif;font-size:16px;font-weight:400;margin:16px 0 8px;color:var(--text)">4 Fase Siklus dan Rekomendasi Aset</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
        <div style="border:1px solid var(--border);border-radius:var(--r2);padding:12px;border-top:3px solid var(--red);border-radius: 12px;"><div style="font-size:10px;color:var(--red);letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px">Fase 1 · Tightening</div><div style="font-size:11.5px;margin-bottom:6px">BI/Fed agresif naikkan suku bunga untuk tekan inflasi</div><div style="font-size:11px;color:var(--green)">· OW: Cash, MMF, Saham defensif</div><div style="font-size:11px;color:var(--red)">· UW: Obligasi jangka panjang, Growth stocks</div></div>
        <div style="border:1px solid var(--border);border-radius:var(--r2);padding:12px;border-top:3px solid var(--amber);border-radius: 12px;"><div style="font-size:10px;color:var(--amber);letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px">Fase 2 · Hold / Puncak Rate</div><div style="font-size:11.5px;margin-bottom:6px">Rate berhenti naik, ekonomi melambat, inflasi turun</div><div style="font-size:11px;color:var(--green)">· OW: Obligasi (entry terbaik), Dividend stocks</div><div style="font-size:11px;color:var(--amber)">· NT: Saham growth, Komoditas</div></div>
        <div style="border:1px solid rgba(95,184,138,.4);border-radius:var(--r2);padding:12px;border-top:3px solid var(--grove);background:rgba(95,184,138,.05);border-radius: 12px"><div style="font-size:10px;color:var(--grove);letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px">Fase 3 · Cutting · SEKARANG</div><div style="font-size:11.5px;margin-bottom:6px">BI/Fed turunkan rate, likuiditas meningkat, risiko berkurang</div><div style="font-size:11px;color:var(--green)">· OW: Saham (perbankan, consumer), Obligasi menengah</div><div style="font-size:11px;color:var(--red)">· UW: Cash terlalu banyak, Deposito jangka panjang</div></div>
        <div style="border:1px solid var(--border);border-radius:var(--r2);padding:12px;border-top:3px solid var(--blue);border-radius: 12px;"><div style="font-size:10px;color:var(--blue);letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px">Fase 4 · Recovery</div><div style="font-size:11.5px;margin-bottom:6px">Ekonomi pulih, earnings naik, confidence kembali</div><div style="font-size:11px;color:var(--green)">· OW: Saham cyclical, Small cap, Komoditas</div><div style="font-size:11px;color:var(--amber)">· NT: Obligasi (yield mulai naik lagi)</div></div>
      </div>
      <div style="background:var(--bg3);border-radius:var(--r2);padding:12px 14px;border-left:3px solid var(--grove);border-radius: 10px 0 0 10px;"><div style="font-size:10px;color:var(--grove);margin-bottom:4px">POSISI GROVE SAAT INI (APR 2026)</div><div style="font-size:12px;color:var(--muted2)">BI dan Fed keduanya dalam Fase 3 (Cutting). Ini secara historis adalah window paling menarik untuk OW saham domestik dan obligasi menengah. Grove merekomendasikan mulai mengurangi porsi MMF/kas dan mengalihkan ke saham perbankan + FR series jika belum dilakukan.</div></div>
      </div>`,
  },
  {
    title: "Psikologi Investasi & Decision Journal",
    kicker: "Modul 6 · Psikologi",
    content: `
      <div style="font-size:12.5px;color:var(--muted2);line-height:1.85">
      <p style="margin-bottom:12px">Annie Duke, mantan juara poker dunia, menemukan bahwa kesalahan investasi terbesar bukan di analisis · tapi di <strong style="color:var(--text)">bias kognitif yang mengacaukan proses pengambilan keputusan</strong>.</p>
      <div style="font-family:'Fraunces',serif;font-size:16px;font-weight:400;margin:16px 0 8px;color:var(--text)">4 Bias yang Paling Berbahaya untuk Investor</div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px">
        <div style="background:var(--bg3);border-radius:var(--r);padding:10px 12px;border-radius:12px"><strong style="color:var(--text)">FOMO (Fear of Missing Out)</strong> · Beli setelah saham naik 50% karena "takut ketinggalan." Antidote: selalu hitung expected return dari harga saat ini, bukan dari harga kemarin.</div>
        <div style="background:var(--bg3);border-radius:var(--r);padding:10px 12px;border-radius:12px"><strong style="color:var(--text)">Resulting</strong> · Menilai kualitas keputusan dari hasilnya, bukan prosesnya. Keputusan bagus bisa berakhir buruk karena nasib. Keputusan buruk bisa berakhir bagus karena beruntung. Jangan belajar dari hasil, belajar dari proses.</div>
        <div style="background:var(--bg3);border-radius:var(--r);padding:10px 12px;border-radius:12px"><strong style="color:var(--text)">Sunk Cost Fallacy</strong> · Mempertahankan saham rugi karena "sudah terlanjur rugi banyak." Uang yang sudah rugi tidak relevan untuk keputusan sekarang. Yang relevan: apakah saham ini masih menarik dari harga saat ini?</div>
        <div style="background:var(--bg3);border-radius:var(--r);padding:10px 12px;border-radius:12px"><strong style="color:var(--text)">Overconfidence</strong> · Merasa yakin 90% padahal hanya 60%. Antidote: selalu tanyakan "apa yang bisa membuat saya salah?" sebelum setiap keputusan.</div>
      </div>
      <div style="font-family:'Fraunces',serif;font-size:16px;font-weight:400;margin:16px 0 8px;color:var(--text)">Pre-Mortem: Teknik Paling Powerful</div>
      <p style="margin-bottom:12px">Sebelum beli saham, bayangkan sudah 1 tahun ke depan dan investasimu gagal total. Tanyakan: <em style="color:var(--grove)">"Mengapa gagal? Apa yang terjadi?"</em> Ini memaksamu melihat risiko yang biasanya diabaikan oleh optimism bias.</p>
      <div style="background:var(--bg3);border-radius:var(--r2);padding:12px 14px;border-left:3px solid var(--grove);border-radius: 12px;"><div style="font-size:10px;color:var(--grove);margin-bottom:4px">CARA PAKAI DECISION JOURNAL GROVE</div><div style="font-size:12px;color:var(--muted2)">Setiap sebelum beli/jual: catat thesis (mengapa), pre-mortem (mengapa bisa salah), dan harga/tanggal. 6 bulan kemudian, buka kembali. Bukan untuk menyesal jika salah, tapi untuk belajar apakah proses analisismu sudah improving.</div></div>
      </div>`,
  },
  {
    title: "Membangun Portofolio Core-Satellite",
    kicker: "Modul 7 · Portfolio",
    content: `
      <div style="font-size:12.5px;color:var(--muted2);line-height:1.85">
      <p style="margin-bottom:12px">Core-Satellite adalah framework portofolio yang memisahkan <strong style="color:var(--text)">stabilitas jangka panjang (core)</strong> dari <strong style="color:var(--text)">peluang return lebih tinggi (satellite)</strong>.</p>
      <div style="font-family:'Fraunces',serif;font-size:16px;font-weight:400;margin:16px 0 8px;color:var(--text)">Struktur Core-Satellite</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
        <div style="border:1px solid rgba(95,184,138,.3);border-radius:var(--r2);padding:14px;background:rgba(95,184,138,.05);border-radius:12px"><div style="font-size:10px;color:var(--grove);letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px">Core (60-70%)</div><div style="font-size:11.5px;margin-bottom:8px;color:var(--text)">Investasi fundamental, rendah biaya, jangka panjang</div><div style="font-size:11px;color:var(--muted2);line-height:1.7">· BBCA, BMRI (blue chip perbankan)<br>· SPY / QQQ (ETF US diversified)<br>· FR100 / INDON (obligasi sovereign)<br>· IDX30 ETF (exposure pasar luas)</div></div>
        <div style="border:1px solid rgba(240,160,48,.3);border-radius:var(--r2);padding:14px;background:rgba(240,160,48,.04);border-radius:12px"><div style="font-size:10px;color:var(--amber);letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px">Satellite (30-40%)</div><div style="font-size:11.5px;margin-bottom:8px;color:var(--text)">High-conviction picks, aktif dimonitor</div><div style="font-size:11px;color:var(--muted2);line-height:1.7">· Small/mid cap multibagger candidates<br>· Saham sektoral dengan katalis kuat<br>· Individual US stocks (NVDA, MSFT)<br>· INDON untuk diversifikasi USD</div></div>
      </div>
      <div style="font-family:'Fraunces',serif;font-size:16px;font-weight:400;margin:16px 0 8px;color:var(--text)">DCA · Dollar Cost Averaging yang Efektif</div>
      <p style="margin-bottom:8px">DCA bukan "beli setiap bulan tanpa pikir." DCA yang efektif adalah <strong style="color:var(--text)">konsisten beli di zona value</strong> · lebih banyak saat harga turun jauh dari fair value, lebih sedikit saat sudah mendekati target.</p>
      <p style="margin-bottom:12px">Gunakan framework Grove: jika Research Score 75+ dan harga di bawah midpoint fair value range, itu adalah zona DCA yang optimal.</p>
      <div style="background:var(--bg3);border-radius:var(--r2);padding:12px 14px;border-left:3px solid var(--grove);border-radius: 12px;"><div style="font-size:10px;color:var(--grove);margin-bottom:4px">REBALANCING BERKALA</div><div style="font-size:12px;color:var(--muted2)">Rebalancing setiap 6-12 bulan atau saat satu aset sudah +/- 10% dari target alokasi. Ini memaksamu "jual yang mahal, beli yang murah" secara otomatis dan disiplin · tanpa emotion.</div></div>
      </div>`,
  },
];

const actionOptions = ["Beli", "Jual", "Pantau", "Tambah posisi"];

function toneStyles(tone: ModuleCard["tone"], featured?: boolean) {
  if (featured) {
    return {
      card: "bg-[linear-gradient(135deg,rgba(95,184,138,0.06),var(--bg2))] border-[rgba(95,184,138,0.35)]",
      icon: "bg-[rgba(95,184,138,0.18)]",
      kicker: "text-[#4ecb8d] font-semibold",
    };
  }

  const tones: Record<ModuleCard["tone"], { icon: string; kicker: string }> = {
    grove: { icon: "bg-[rgba(95,184,138,0.12)]", kicker: "text-[#4ecb8d]" },
    blue: { icon: "bg-[rgba(58,158,232,0.12)]", kicker: "text-[#3A9EE8]" },
    gold: { icon: "bg-[rgba(200,168,75,0.12)]", kicker: "text-[#C8A84B]" },
    purple: { icon: "bg-[rgba(154,114,232,0.12)]", kicker: "text-[#9A72E8]" },
    red: { icon: "bg-[rgba(224,72,72,0.10)]", kicker: "text-[#E04848]" },
    green: { icon: "bg-[rgba(34,201,122,0.12)]", kicker: "text-[#22C97A]" },
    base: { icon: "bg-[rgba(95,184,138,0.12)]", kicker: "text-[#4ecb8d]" },
  };

  return {
    card: "bg-grove-bg2 border-grove-border",
    icon: tones[tone].icon,
    kicker: tones[tone].kicker,
  };
}

export function EducationPageContent() {
  const [activeModule, setActiveModule] = useState<number | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [ticker, setTicker] = useState("");
  const [action, setAction] = useState(actionOptions[0]);
  const [price, setPrice] = useState("");
  const [thesis, setThesis] = useState("");
  const [risk, setRisk] = useState("");

  const reader = useMemo(() => {
    if (activeModule === null) return null;
    return moduleContent[activeModule];
  }, [activeModule]);

  const actionColors: Record<string, string> = {
    Beli: "#22C97A",
    Jual: "#E04848",
    Pantau: "#F0A030",
    "Tambah posisi": "#5FB88A",
  };

  const handleSave = () => {
    if (!ticker.trim() || !thesis.trim()) {
      window.alert("Isi minimal Instrumen dan Thesis terlebih dahulu.");
      return;
    }

    const newEntry: JournalEntry = {
      id: Date.now(),
      ticker: ticker.trim(),
      action,
      price: price.trim(),
      thesis: thesis.trim(),
      risk: risk.trim(),
      date: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };

    setEntries((prev) => [newEntry, ...prev]);
    setTicker("");
    setPrice("");
    setThesis("");
    setRisk("");
  };

  return (
    <main className="container-shell py-8 animate-fadeUp">
      <div className="port-hero text-center">
        <h1 className="mb-2 font-serif text-[28px] font-normal tracking-[-.01em]">
          Pusat <em className="italic text-[#4ecb8d]">Edukasi</em>
        </h1>
        <p className="mx-auto max-w-[600px] text-[13px] leading-[1.75] text-grove-muted2">
          Kurikulum terstruktur dari dasar hingga advanced · membangun pemahaman
          sistemik yang menghubungkan teori dengan kondisi pasar nyata.
        </p>
      </div>

      {activeModule === null ? (
        <div
          className="grid gap-[14px] sm:grid-cols-2 lg:grid-cols-3"
          id="edu-modules"
        >
          {moduleCards.map((card) => {
            const styles = toneStyles(card.tone, card.featured);
            return (
              <button
                key={card.id}
                onClick={() => setActiveModule(card.id)}
                className={`group relative rounded-[12px] border p-5 text-left transition-all hover:-translate-y-[2px] hover:border-[#4ecb8d] ${styles.card}`}
              >
                {card.featured ? (
                  <span className="pointer-events-none absolute right-3 top-2 font-serif text-[52px] font-medium tracking-[-0.03em] text-[#4ecb8d] opacity-[0.12]">
                    G
                  </span>
                ) : null}
                <div
                  className={`mb-3 flex h-9 w-9 items-center justify-center rounded-[8px] ${styles.icon}`}
                >
                  {card.icon}
                </div>
                <div
                  className={`mb-2 text-[9px] uppercase tracking-[.12em] ${styles.kicker}`}
                >
                  {card.kicker}
                </div>
                <div className="mb-2 font-serif text-[16px] font-normal">
                  {card.title}
                </div>
                <div className="text-[11.5px] leading-[1.7] text-grove-muted2">
                  {card.desc}
                </div>
                <div className="mt-3 text-[10px] text-grove-muted">
                  {card.meta}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div
          className="rounded-[14px] border border-grove-border bg-grove-bg2 p-7"
          id="edu-reader"
        >
          <button
            onClick={() => setActiveModule(null)}
            className="mb-5 flex items-center gap-2 text-[11px] text-grove-muted2"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M8 2L4 6l4 4" />
            </svg>
            Kembali ke semua modul
          </button>
          {reader ? (
            <div id="edu-reader-content">
              <div className="mb-2 text-[9px] uppercase tracking-[.15em] text-[#4ecb8d]">
                {reader.kicker}
              </div>
              <div className="mb-6 font-serif text-[24px] font-normal tracking-[-.01em]">
                {reader.title}
              </div>
              <div dangerouslySetInnerHTML={{ __html: reader.content }} />
            </div>
          ) : null}
        </div>
      )}

      <div className="mt-10 font-serif text-[18px] font-normal tracking-[-.01em]">
        Decision <em className="italic text-[#4ecb8d]">Journal</em> · Catat
        Keputusan Investasimu
      </div>
      <div className="mt-3 rounded-[12px] border border-grove-border bg-grove-bg2 p-6">
        <div className="mb-5 text-[11px] leading-[1.7] text-grove-muted2">
          Berdasarkan prinsip Annie Duke: catat thesis investasi sebelum beli ·
          bukan setelah. Ini melatihmu menilai kualitas keputusan berdasarkan
          proses, bukan hasil.
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
          <div>
            <div className="mb-1 text-[10px] text-grove-muted">Instrumen</div>
            <input
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="Contoh: BBCA, FR100, INDON..."
              className="w-full rounded-[6px] border border-grove-border2 bg-grove-bg3 px-3 py-2 text-[12px] text-grove-text"
            />
          </div>
          <div>
            <div className="mb-1 text-[10px] text-grove-muted">Aksi</div>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full rounded-[6px] border border-grove-border2 bg-grove-bg3 px-3 py-2 text-[12px] text-grove-text"
            >
              {actionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="mb-1 text-[10px] text-grove-muted">
              Harga / Yield
            </div>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Contoh: Rp 9.800 / 6.85%"
              className="w-full rounded-[6px] border border-grove-border2 bg-grove-bg3 px-3 py-2 text-[12px] text-grove-text"
            />
          </div>
          <div className="hidden md:block" />
        </div>
        <div className="mt-3">
          <div className="mb-1 text-[10px] text-grove-muted">
            Thesis Investasi (Mengapa keputusan ini masuk akal berdasarkan
            informasi saat ini?)
          </div>
          <textarea
            value={thesis}
            onChange={(e) => setThesis(e.target.value)}
            placeholder="Contoh: BBCA di Rp 9.800 menarik karena valuasi di bawah historis PBV 3.5x, NIM terkuat di industri, dan katalis BI cut cycle yang akan re-rate perbankan dalam 6-12 bulan ke depan..."
            className="min-h-[70px] w-full resize-y rounded-[6px] border border-grove-border2 bg-grove-bg3 px-3 py-2 text-[12px] leading-[1.6] text-grove-text"
          />
        </div>
        <div className="mt-3">
          <div className="mb-1 text-[10px] text-grove-muted">
            Pre-mortem: Apa yang bisa membuat keputusan ini salah?
          </div>
          <input
            value={risk}
            onChange={(e) => setRisk(e.target.value)}
            placeholder="Contoh: NIM tertekan lebih dalam, asing terus net sell, atau makro global memburuk..."
            className="w-full rounded-[6px] border border-grove-border2 bg-grove-bg3 px-3 py-2 text-[12px] text-grove-text"
          />
        </div>
        <button
          onClick={handleSave}
          className="mt-4 rounded-[10px] bg-[#5FB88A] px-5 py-2 text-[12px] font-semibold text-[#0A0E0B]"
        >
          Simpan Catatan
        </button>
        <div className="mt-5 flex flex-col gap-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-[12px] border-l-[3px] bg-grove-bg3 px-4 py-3"
              style={{ borderColor: actionColors[entry.action] ?? "#5FB88A" }}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-grove-text">
                    {entry.ticker}
                  </span>
                  <span
                    className="rounded-[8px] px-2 py-0.5 text-[9px]"
                    style={{
                      background: `${actionColors[entry.action] ?? "#5FB88A"}22`,
                      color: actionColors[entry.action] ?? "#5FB88A",
                    }}
                  >
                    {entry.action}
                  </span>
                  {entry.price ? (
                    <span className="text-[11px] text-grove-muted">
                      {entry.price}
                    </span>
                  ) : null}
                </div>
                <span className="text-[10px] text-grove-muted">
                  {entry.date}
                </span>
              </div>
              <div
                className={`text-[11.5px] leading-[1.65] text-grove-muted2 ${
                  entry.risk ? "mb-2" : ""
                }`}
              >
                {entry.thesis}
              </div>
              {entry.risk ? (
                <div className="text-[10.5px] leading-[1.6] text-[#F0A030]">
                  <span className="opacity-70">Pre-mortem: </span>
                  {entry.risk}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
