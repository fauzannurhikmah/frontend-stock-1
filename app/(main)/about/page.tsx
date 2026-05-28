import Link from "next/link";

const founderTags = [
  "Investor Saham Aktif",
  "Sehati Group",
  "Ex-IAI",
  "West Java",
];

const coFounders = [
  {
    initials: "VV",
    name: "Vivi Vimalasari",
    role: "Co-Founder & COO",
    accent: "text-grove-amber",
    ring: "border-[rgba(240,160,48,0.3)]",
    fill: "bg-[rgba(240,160,48,0.1)]",
    badge:
      "bg-[rgba(240,160,48,0.1)] text-grove-amber border-[rgba(240,160,48,0.2)]",
    summary:
      "Branch Manager PT Panin Sekuritas selama 13+ tahun di Bandung. Co-Founder Investor Academy Indonesia. Certified Trainer dan Asesor Kompetensi BNSP.",
    detail:
      "Di Grove, Vivi memastikan semua program benar-benar terjadi: webinar, bootcamp, field research trip, summit. Termasuk panduan obligasi FR & INDON dan moderasi komunitas member.",
    badges: [
      "Certified Trainer BNSP",
      "Panin Sekuritas 13+ thn",
      "Co-Founder IAI",
    ],
  },
  {
    initials: "SG",
    name: "Syanne Gracetine",
    role: "Co-Founder & CMO",
    accent: "text-grove-blue",
    ring: "border-[rgba(58,158,232,0.3)]",
    fill: "bg-[rgba(58,158,232,0.1)]",
    badge:
      "bg-[rgba(58,158,232,0.1)] text-grove-blue border-[rgba(58,158,232,0.2)]",
    summary:
      "CSA Certified, ex-Senior Equity Research Analyst di Tomak Uang, ex-Educator Emtrade, Investment Journalist, dan Head of Investment Specialist di Syailendra Capital.",
    detail:
      "Kombinasi langka: bisa baca dan validasi riset mendalam sekaligus bisa jadikan konten yang menjangkau audiens luas. Di Grove, Shanne memastikan konten berkualitas sampai ke investor yang tepat.",
    badges: ["CSA Certified", "Senior Equity Research", "Syailendra Capital"],
  },
  {
    initials: "ST",
    name: "Steven Tjitra",
    role: "Co-Founder & CRO",
    accent: "text-[#9A72E8]",
    ring: "border-[rgba(154,114,232,0.3)]",
    fill: "bg-[rgba(154,114,232,0.1)]",
    badge:
      "bg-[rgba(154,114,232,0.1)] text-[#9A72E8] border-[rgba(154,114,232,0.2)]",
    summary:
      "Fund Manager dan Investment Analyst di Syailendra Capital selama 3+ tahun. Level II CFA, Master's dari Hong Kong Polytechnic University, Bachelor's Finance dari National Taiwan University.",
    detail:
      "Membawa standar riset institusional ke platform Grove. Bertanggung jawab atas riset emiten mendalam, laporan premium, weekly technical update, dan operasional platform.",
    badges: ["Level II CFA", "Fund Manager", "Syailendra Capital"],
  },
];

const principles = [
  {
    title: "Transparent track record",
    text: "Posisi rugi ditampilkan sama prominennya dengan yang untung. Tidak ada backfilling, tidak ada cherry-picking.",
    icon: (
      <path
        d="M8 2l1.5 4.5H14l-3.5 2.5 1.5 4.5L8 11l-4 2.5 1.5-4.5L2 6.5h4.5z"
        fill="#5FB88A"
      />
    ),
  },
  {
    title: "Multi-aset, bukan hanya saham",
    text: "Saham Indonesia & Amerika, obligasi IDR & USD, MMF, ETF - semua dalam satu framework rotasi aset.",
    icon: (
      <>
        <rect x="2" y="10" width="3" height="4" rx="1" fill="#5FB88A" />
        <rect
          x="6.5"
          y="6"
          width="3"
          height="8"
          rx="1"
          fill="#5FB88A"
          opacity="0.7"
        />
        <rect
          x="11"
          y="2"
          width="3"
          height="12"
          rx="1"
          fill="#5FB88A"
          opacity="0.4"
        />
      </>
    ),
  },
  {
    title: "Konsistensi adalah janji",
    text: "Market Compass setiap Senin. Asset allocation setiap awal bulan. Komunitas aktif dengan respons < 24 jam.",
    icon: (
      <>
        <circle cx="8" cy="8" r="6" stroke="#5FB88A" strokeWidth="1.5" />
        <path
          d="M8 5v3l2 2"
          stroke="#5FB88A"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </>
    ),
  },
];

const grovePillars = [
  {
    letter: "G",
    title: "Growth Earnings",
    text: "Kualitas & pertumbuhan fundamental bisnis",
  },
  {
    letter: "R",
    title: "Relative Strength",
    text: "Leader atau laggard vs pasar",
  },
  { letter: "O", title: "Orientasi Tren", text: "Struktur tren harga & stage" },
  {
    letter: "V",
    title: "Volume & Volatility",
    text: "Likuiditas & kualitas pergerakan",
  },
  {
    letter: "E",
    title: "Endorsement Smart Money",
    text: "Flow asing, institusi, bandar",
  },
];

const horizons = [
  {
    title: "Long Term",
    text: "Kualitas bisnis dominan - beli fundamental, hold bertahun-tahun",
  },
  {
    title: "Medium Term",
    text: "Seimbang - fundamental & momentum sama pentingnya",
  },
  {
    title: "Short Term",
    text: "Momentum & flow dominan - timing lebih berperan",
  },
];

export default function AboutPage() {
  return (
    <main className="container-shell animate-fadeUp pb-16 pt-12 md:pb-20 md:pt-16">
      <section className="mx-auto max-w-[900px] border-b border-grove-border pb-12 text-center md:pb-14">
        <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-grove-primary">
          Tentang Kami
        </div>
        <h1 className="mx-auto max-w-[760px] font-serif text-[clamp(2.2rem,4vw,3.5rem)] font-normal leading-[1.15] tracking-[-0.015em] text-grove-text">
          Dibangun oleh investor,
          <br />
          <em className="italic text-grove-primary">untuk investor.</em>
        </h1>
        <p className="mx-auto mt-4 max-w-[560px] text-[14px] leading-[1.8] text-grove-muted2">
          Grove lahir dari frustrasi yang sama: terlalu banyak informasi
          investasi yang membuat bingung, terlalu sedikit yang benar-benar
          membantu memutuskan. Kami membangun platform yang ingin kami pakai
          sendiri.
        </p>
      </section>

      <section className="mx-auto mb-12 grid max-w-[900px] gap-10 py-12 lg:grid-cols-[1fr_2fr] lg:items-start">
        <div>
          <div className="mb-4 flex h-[120px] w-[120px] items-center justify-center rounded-full border border-[rgba(95,184,138,0.3)] bg-[linear-gradient(135deg,rgba(95,184,138,0.1),rgba(26,35,36,1))]">
            <span className="font-serif text-[36px] text-grove-primary">
              AL
            </span>
          </div>
          <div className="mb-1 font-serif text-[20px] font-normal text-grove-text">
            Andre Lukito
          </div>
          <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.1em] text-grove-primary">
            Founder & CVO
          </div>
          <div className="flex flex-wrap gap-1.5">
            {founderTags.map((tag) => (
              <span
                key={tag}
                className={`rounded-full border px-2.5 py-0.5 text-[10px] ${
                  tag === "Investor Saham Aktif"
                    ? "border-[rgba(95,184,138,0.25)] bg-[rgba(95,184,138,0.1)] text-grove-primary"
                    : "border-grove-border bg-grove-bg3 text-grove-muted2"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-5 rounded-r-[12px] border border-grove-border border-l-4 border-l-grove-primary bg-grove-bg2 p-6">
            <p className="font-serif text-[16px] italic leading-[1.65] text-grove-text">
              “Grove ada karena saya tidak menemukan platform yang benar-benar
              membantu investor memutuskan - bukan hanya memberi informasi, tapi
              framework berpikir yang bisa diterapkan langsung.”
            </p>
          </div>
          <p className="mb-4 text-[13px] leading-[1.85] text-grove-muted2">
            Managing Director di{" "}
            <strong className="text-grove-text">Sehati Group</strong> dan
            investor saham aktif dengan pengalaman di pasar Indonesia dan
            Amerika. Sebelumnya aktif di{" "}
            <strong className="text-grove-text">
              Investor Academy Indonesia (IAI)
            </strong>{" "}
            - pengalaman langsung mendampingi ribuan investor ritel menemukan
            cara berpikir yang lebih sistematis.
          </p>
          <p className="text-[13px] leading-[1.85] text-grove-muted2">
            Di Grove, Andre bertanggung jawab atas arah strategis produk, Market
            Compass mingguan, makro deep dive, dan semua analisis alokasi aset.
            Cara berpikirnya - probabilistik, berbasis framework, jujur tentang
            risiko - adalah DNA dari seluruh riset Grove.
          </p>
        </div>
      </section>

      <div className="mx-auto mb-12 h-px max-w-[900px] bg-grove-border" />

      <section className="mx-auto mb-12 max-w-[900px]">
        <div className="mb-6 text-[10px] font-medium uppercase tracking-[0.18em] text-grove-primary">
          Co-Founders
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {coFounders.map((person) => (
            <article
              key={person.name}
              className="overflow-hidden rounded-grove-3 border border-grove-border bg-grove-bg2"
            >
              <div
                className={`h-[3px] ${person.name === "Vivi Vimalasari" ? "bg-grove-amber" : person.name === "Syanne Gracetine" ? "bg-grove-blue" : "bg-[#9A72E8]"}`}
              />
              <div className="p-6">
                <div
                  className={`mb-3 flex h-16 w-16 items-center justify-center rounded-full border ${person.ring} ${person.fill}`}
                >
                  <span className={`font-serif text-[20px] ${person.accent}`}>
                    {person.initials}
                  </span>
                </div>
                <div className="mb-1 font-serif text-[17px] font-normal text-grove-text">
                  {person.name}
                </div>
                <div
                  className={`mb-3 text-[10px] font-medium uppercase tracking-[0.1em] ${person.accent}`}
                >
                  {person.role}
                </div>
                <p className="mb-3 text-[12px] leading-[1.75] text-grove-muted2">
                  {person.summary}
                </p>
                <p className="text-[12px] leading-[1.75] text-grove-muted2">
                  {person.detail}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {person.badges.map((badge, index) => (
                    <span
                      key={badge}
                      className={`rounded-full border px-2 py-0.5 text-[10px] ${
                        index === 0
                          ? person.badge
                          : "border-grove-border bg-transparent text-grove-muted"
                      }`}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="mx-auto mb-12 h-px max-w-[900px] bg-grove-border" />

      <section className="mx-auto mb-12 grid max-w-[900px] gap-8 lg:grid-cols-2">
        <div>
          <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-grove-primary">
            Kenapa Grove ada
          </div>
          <h2 className="mb-4 font-serif text-[clamp(1.5rem,2.6vw,2.25rem)] font-normal leading-[1.3] text-grove-text">
            Kami bukan sumber sinyal.
            <br />
            <em className="italic text-grove-primary">
              Kami adalah framework berpikir.
            </em>
          </h2>
          <p className="mb-4 text-[13px] leading-[1.85] text-grove-muted2">
            Banyak platform investasi memberikan rekomendasi saham tanpa
            menjelaskan kenapa, tanpa menyebut risiko, dan tanpa bilang kapan
            keluarnya. Investor yang mengikutinya tidak belajar apa-apa - mereka
            hanya bergantung.
          </p>
          <p className="text-[13px] leading-[1.85] text-grove-muted2">
            Grove dirancang sebaliknya: setiap analisis punya thesis yang bisa
            ditelusuri, risiko yang didefinisikan, dan trigger keluar yang jelas
            sejak awal. Tujuannya bukan membuat kamu bergantung pada Grove -
            tapi membuat kamu bisa berpikir lebih baik tentang investasi, dengan
            atau tanpa kami.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {principles.map((principle) => (
            <div
              key={principle.title}
              className="flex items-start gap-3 rounded-grove-2 border border-grove-border bg-grove-bg2 p-5"
            >
              <div className="flex h-8 w-8 flex-none items-center justify-center rounded-grove bg-[var(--grove-dim)]">
                <svg
                  viewBox="0 0 16 16"
                  className="h-4 w-4"
                  fill="none"
                  aria-hidden="true"
                >
                  {principle.icon}
                </svg>
              </div>
              <div>
                <div className="mb-1 text-[12px] font-medium text-grove-text">
                  {principle.title}
                </div>
                <div className="text-[11px] leading-[1.6] text-grove-muted2">
                  {principle.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto mb-12 h-px max-w-[900px] bg-grove-border" />

      <section className="mx-auto max-w-[760px] rounded-grove-3 border border-grove-border bg-grove-bg2 p-6 text-center md:p-10">
        <h2 className="mb-3 font-serif text-[clamp(1.65rem,3vw,2.25rem)] font-normal leading-[1.3] text-grove-text">
          Siap berpikir lebih sistematis tentang
          <br />
          <em className="italic text-grove-primary">portofolio kamu?</em>
        </h2>
        <p className="mx-auto mb-7 max-w-[620px] text-[13px] leading-[1.7] text-grove-muted2">
          Mulai gratis - tidak perlu kartu kredit. Upgrade ke Member saat kamu
          yakin ini berguna.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/#pricing-section"
            className="inline-flex items-center gap-2 rounded-grove-2 bg-grove-primary px-6 py-[11px] text-[12px] font-semibold tracking-[0.02em] text-[#0A0E0B] transition-all duration-200 hover:bg-grove-primary2"
          >
            Lihat harga & mulai
            <svg
              viewBox="0 0 12 12"
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M2 6h8M6 2l4 4-4 4" />
            </svg>
          </Link>
          <Link
            href="/track-record"
            className="inline-flex items-center rounded-grove-2 border border-grove-border bg-transparent px-5 py-3 text-[12px] font-medium text-grove-muted2 transition hover:border-grove-border2 hover:text-grove-text"
          >
            Lihat track record →
          </Link>
        </div>
      </section>
    </main>
  );
}
