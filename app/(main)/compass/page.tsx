"use client";

import { useEffect, useRef, useState } from "react";
import { MacroDimensionCards } from "@/components/compass/MacroDimensionCards";
import { RotationCards } from "@/components/compass/RotationCards";
import { SectorCards } from "@/components/compass/SectorCards";
import { InvestorStrategyCards } from "@/components/compass/InvestorStrategyCards";
import { YTMCalculator } from "@/components/compass/YTMCalculator";

// Macro score gauge
function MacroScoreCard() {
  const score = 72;
  const zones = [
    {
      label: "0–34 Risk Off",
      flex: 0.34,
      color: "rgba(217,96,96,0.3)",
      rounded: "rounded-l-[3px]",
    },
    { label: "35–49 Kautius", flex: 0.15, color: "rgba(224,164,68,0.3)" },
    { label: "50–64 Netral", flex: 0.15, color: "rgba(151,160,148,0.3)" },
    {
      label: "65–79 Konstruktif",
      flex: 0.15,
      color: "rgba(95,184,138,0.7)",
      marker: true,
    },
    {
      label: "80–100 Risk On",
      flex: 0.21,
      color: "rgba(127,209,163,0.3)",
      rounded: "rounded-r-[3px]",
    },
  ];

  return (
    <div className="mb-6 rounded-[12px] border border-[rgba(95,184,138,0.3)] bg-[linear-gradient(135deg,rgba(95,184,138,0.08),var(--bg2))] p-7">
      <div className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
        {/* Score left */}
        <div className="text-center md:border-r md:border-grove-border md:pr-6">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[.15em] text-grove-muted">
            Macro Score
          </p>
          <p className="font-serif text-[68px] font-medium leading-none tracking-[-0.03em] text-[#4ecb8d]">
            {score}
          </p>
          <p className="mt-1 text-[10px] text-grove-muted">/ 100</p>
          <span className="mt-2 inline-block rounded-full bg-[rgba(95,184,138,0.15)] px-3 py-1 text-[11px] font-medium uppercase tracking-[.05em] text-[#4ecb8d]">
            Konstruktif
          </span>
        </div>

        {/* Narrative right */}
        <div>
          <p className="mb-3 font-serif text-[19px] font-normal leading-[1.4] text-grove-text">
            Fed & BI keduanya dalam{" "}
            <em className="italic text-[#4ecb8d]">siklus penurunan rate</em>.
            Indonesia di sweet spot: GDP stabil, inflasi terkendali, likuiditas
            domestik naik.
          </p>
          <p className="text-[12px] leading-[1.7] text-grove-muted2">
            Namun tarif AS–China tetap elevated — selektif di saham ekspor
            komoditas. Market Sentiment kuat: foreign net buy Rp 3.2T minggu
            lalu, IHSG +4.2% YTD.
          </p>
        </div>
      </div>

      {/* Gauge bar */}
      <div className="mt-6 border-t border-grove-border pt-5">
        <div className="mb-2 flex gap-1.5">
          {zones.map((z) => (
            <div
              key={z.label}
              className={`relative h-[6px] ${z.rounded ?? ""}`}
              style={{ flex: z.flex, backgroundColor: z.color }}
            >
              {z.marker ? (
                <span className="absolute left-[80%] top-[-10px] h-[26px] w-[2px] -translate-x-1/2 bg-[var(--grove-bright,#7FD1A3)]" />
              ) : null}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[9px] tracking-[.05em] text-grove-muted">
          {zones.map((z, i) => (
            <span
              key={z.label}
              className={i === 3 ? "font-medium text-[#4ecb8d]" : ""}
            >
              {z.label}
              {i === 3 ? " ●" : ""}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CompassPage() {
  const [macroDetailIndex, setMacroDetailIndex] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (macroDetailIndex !== null && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [macroDetailIndex]);

  const macroDetailsData = [
    {
      title: "Global Rate & Liquidity — Skor 78/100",
      narrative:
        "Fed telah melakukan <em>2 cut rate</em> di 2025 dan sinyal dovish untuk 2026. DXY melemah dari 107 ke 102.4, artinya dolar sedang kehilangan kekuatan terhadap mata uang lainnya. Ini <em>window tailwind</em> untuk emerging markets termasuk Indonesia — modal global akan mencari yield yang lebih tinggi di luar AS.",
      why: "Skor tinggi (78) karena semua sinyal global moneter sedang mendukung risk assets. Fed cutting + DXY melemah + US 10Y stabil di 4.18% — kombinasi ideal untuk EM equity rally.",
      news: [
        {
          date: "18 Apr 2026",
          title:
            "Fed Pivots More Dovish in March Minutes — Markets Price in 3 More Cuts for 2026",
          source: "Bloomberg",
        },
        {
          date: "15 Apr 2026",
          title: "DXY Falls to 6-Month Low as Dollar Softens Across G10",
          source: "Reuters",
        },
        {
          date: "12 Apr 2026",
          title: "EM Funds See $8.2B Weekly Inflows — Largest Since Nov 2023",
          source: "Financial Times",
        },
      ],
    },
    {
      title: "Domestic Rate & Currency — Skor 74/100",
      narrative:
        "BI telah memulai <em>cutting cycle</em> dengan penurunan 25 bps ke 5.50% bulan lalu. Rupiah relatif stabil di 16,180 — tidak terlalu kuat maupun terlalu lemah. Cadangan devisa naik ke USD 156 miliar, level tertinggi dalam 18 bulan. Kombinasi ini memberi ruang untuk <em>cut lebih lanjut</em> tanpa mengganggu stabilitas FX.",
      why: "Skor 74 mencerminkan kondisi domestik moneter yang konstruktif tapi belum optimal. BI masih hati-hati karena tarif AS-China menciptakan ketidakpastian ekspor. Jika Rupiah tetap stabil 2-3 bulan ke depan, skor bisa naik ke 80+.",
      news: [
        {
          date: "17 Apr 2026",
          title: "BI Rate Dipangkas 25 bps ke 5.50% — Dewan Gubernur Dovish",
          source: "Kontan",
        },
        {
          date: "16 Apr 2026",
          title: "Cadev Indonesia Naik ke USD 156 Miliar — Rekor 18 Bulan",
          source: "CNBC Indonesia",
        },
        {
          date: "10 Apr 2026",
          title: "Rupiah Stabil di 16,180 — Foreign Inflow Dukung Kurs",
          source: "Bisnis Indonesia",
        },
      ],
    },
    {
      title: "Growth & Activity — Skor 68/100",
      narrative:
        "GDP Indonesia 2026E diperkirakan <em>5.1%</em> — sedikit di bawah konsensus awal 5.3%. Manufacturing PMI pulih ke 51.8 (ekspansif), tapi Consumer Confidence stabil di 116 tanpa akselerasi. Retail sales tumbuh 4.2% YoY, masih <em>below historical trend 6-7%</em>.",
      why: "Skor 68 (amber) karena pertumbuhan solid tapi belum akseleratif. Tarif AS-China menekan sektor ekspor (tekstil, furnitur). Daya beli domestik middle-class baru pulih, belum sepenuhnya recovery dari tekanan 2024-2025.",
      news: [
        {
          date: "20 Apr 2026",
          title: "GDP Q1 2026 Diperkirakan 5.1% — Sedikit di Bawah Konsensus",
          source: "Bank Indonesia",
        },
        {
          date: "14 Apr 2026",
          title: "PMI Manufaktur April 51.8 — Ekspansi Melambat",
          source: "S&P Global",
        },
        {
          date: "08 Apr 2026",
          title:
            "Retail Sales Maret +4.2% YoY — Middle Class Recovery Bertahap",
          source: "BPS",
        },
      ],
    },
    {
      title: "Inflation & Fiscal — Skor 64/100",
      narrative:
        "CPI headline <em>2.8% YoY</em> — mendekati target BI (2.5-3.5%). Core inflation 2.4%, stabil. Namun fiskal defisit 2.5% GDP cukup tinggi karena belanja infrastruktur dan subsidi energi. Debt/GDP 38.5% — masih aman tapi trajectory naik.",
      why: "Skor 64 (netral-kautius) karena inflasi terkendali (bagus) tapi defisit fiskal lebih lebar dari ideal (kurang bagus). Rating agencies masih comfortable dengan BB+ (S&P), tapi Moody's sudah issue concern notes.",
      news: [
        {
          date: "21 Apr 2026",
          title: "CPI Maret 2.8% YoY — Core Stabil, BI Leluasa Cut Rate",
          source: "BPS",
        },
        {
          date: "19 Apr 2026",
          title:
            "Defisit APBN Q1 2026 di 2.5% GDP — Belanja Infrastruktur Naik",
          source: "Kemenkeu",
        },
        {
          date: "11 Apr 2026",
          title:
            "Moody\'s Affirm Indonesia Baa2 — Outlook Stable Namun Tekanan Fiskal Diperhatikan",
          source: "Moody's",
        },
      ],
    },
    {
      title: "Market Sentiment — Skor 80/100",
      narrative:
        "IHSG YTD <em>+4.2%</em> dengan momentum positif setelah bear market 2025. Foreign flow <em>net buy Rp 3.2 T</em> minggu lalu — terbesar sejak Nov 2024. VIX global rendah di 14.8 (risk-on mode). Credit spread menyempit, investor risk appetite pulih.",
      why: "Skor tinggi (80) karena semua indikator sentimen menyala hijau. Ini yang mendorong Macro Score overall ke zona Konstruktif. Namun sentiment bisa berubah cepat — perlu pantau foreign flow weekly.",
      news: [
        {
          date: "22 Apr 2026",
          title: "Foreign Net Buy Rp 3.2 T — Terbesar Sejak Nov 2024",
          source: "BEI",
        },
        {
          date: "18 Apr 2026",
          title: "IHSG Tembus 7,450 — Target Konsensus 7,800 di Akhir 2026",
          source: "Investor Daily",
        },
        {
          date: "15 Apr 2026",
          title: "VIX Global di 14.8 — Risk-On Mode Kembali ke Pasar EM",
          source: "CNBC",
        },
      ],
    },
  ];
  return (
    <main className="container-shell py-10 animate-fadeUp">
      {/* ── Hero ── */}
      <header className="mb-10 text-center">
        <h1 className="mb-2 font-serif text-[28px] font-normal">
          Grove <em className="italic text-[#4ecb8d]">Compass</em>
        </h1>
        <p className="mx-auto max-w-[520px] text-[13px] leading-[1.75] text-grove-muted2">
          Peta arah pasar. Dari kondisi makro global, rotasi sektor IHSG, hingga
          strategi alokasi sesuai profil risikomu.
        </p>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-grove-muted">
          <span className="inline-block h-[5px] w-[5px] rounded-full bg-[#4ecb8d]" />
          Update mingguan · Senin pagi · Apr 2026
        </p>
      </header>

      {/* ══ BLOK 1 · MACRO ══ */}
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-3 border-t border-grove-border pt-6">
        <p className="text-[9px] font-medium uppercase tracking-[.2em] text-[#4ecb8d]">
          Blok 1 · Macro
        </p>
        <p className="text-[11px] text-grove-muted">
          Klik setiap indikator untuk narasi lengkap
        </p>
      </div>
      <h2 className="mb-5 font-serif text-[22px] font-normal tracking-[-0.01em]">
        Cuaca Makro — <em className="italic">Apr 2026</em>
      </h2>

      <MacroScoreCard />
      <MacroDimensionCards onOpen={(i) => setMacroDetailIndex(i)} />

      {macroDetailIndex !== null && (
        <div
          ref={panelRef}
          className="mt-4 rounded-[12px] border border-[rgba(95,184,138,0.3)] bg-grove-bg2 overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-grove-border p-4">
            <h3 className="font-serif text-[18px] font-normal tracking-[-0.01em]">
              {macroDetailsData[macroDetailIndex].title}
            </h3>
            <button
              onClick={() => setMacroDetailIndex(null)}
              className="rounded-[8px] border border-grove-border px-3 py-1 text-[11px] text-grove-muted2"
            >
              Tutup ✕
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[#4ecb8d]">
                Narasi &amp; Interpretasi
              </div>
              <div
                className="text-[13px] leading-[1.75] text-grove-text [&_em]:text-[#4ecb8d] [&_em]:italic"
                dangerouslySetInnerHTML={{
                  __html: macroDetailsData[macroDetailIndex].narrative,
                }}
              />
            </div>

            <div>
              <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[#4ecb8d]">
                Mengapa Skor Ini?
              </div>
              <div className="rounded-[10px] border border-[rgba(95,184,138,0.2)] bg-[rgba(95,184,138,0.05)] p-4">
                <div className="mb-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#4ecb8d]">
                  Reasoning Tim Riset Grove
                </div>
                <div
                  className="text-[12px] leading-[1.7] text-[#b6bdb2]"
                  dangerouslySetInnerHTML={{
                    __html: macroDetailsData[macroDetailIndex].why,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.12em] text-[#4ecb8d]">
                Berita &amp; Data Pendukung
              </div>
              <div className="space-y-2">
                {macroDetailsData[macroDetailIndex].news.map((n, idx) => (
                  <div
                    key={idx}
                    className="rounded-[8px] border-l-2 border-[#4ecb8d] bg-grove-bg3 px-3 py-2"
                  >
                    <div className="text-[9px] font-medium uppercase tracking-[0.08em] text-[#4ecb8d]">
                      {n.date}
                    </div>
                    <div className="mt-1 text-[12px] font-medium leading-[1.45] text-grove-text">
                      {n.title}
                    </div>
                    <div className="mt-1 text-[10px] text-grove-muted">
                      Sumber: {n.source}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ BLOK 2 · ROTATION ══ */}
      <div className="mb-2 border-t border-grove-border pt-8">
        <p className="text-[9px] font-medium uppercase tracking-[.2em] text-[#4ecb8d]">
          Blok 2 · Rotation
        </p>
      </div>
      <h2 className="mb-5 font-serif text-[22px] font-normal tracking-[-0.01em]">
        Rotasi Aset & <em className="italic">Sektor IHSG</em>
      </h2>

      {/* Asset class rotation */}
      <div className="mb-4 rounded-[12px] border border-grove-border bg-grove-bg2 px-7 py-6">
        <p className="mb-4 text-[10px] font-medium uppercase tracking-[.12em] text-grove-muted">
          Alokasi Antar Kelas Aset
        </p>
        <RotationCards />
      </div>

      {/* Sector IHSG */}
      <div className="rounded-[12px] border border-grove-border bg-grove-bg2 px-7 py-6">
        <p className="mb-4 text-[10px] font-medium uppercase tracking-[.12em] text-grove-muted">
          Sektor IHSG — Urut dari Terkuat
        </p>
        <SectorCards />
      </div>

      {/* ══ BLOK 3 · PORTFOLIO ══ */}
      <div className="mb-2 mt-10 border-t border-grove-border pt-8">
        <p className="text-[9px] font-medium uppercase tracking-[.2em] text-[#4ecb8d]">
          Blok 3 · Portfolio
        </p>
      </div>
      <h2 className="mb-1 font-serif text-[22px] font-normal tracking-[-0.01em]">
        Strategi Portofolio — <em className="italic">Sesuai Profil Risiko</em>
      </h2>
      <p className="mb-5 text-[12.5px] leading-[1.7] text-grove-muted2">
        Alokasi di bawah sudah disesuaikan dengan kondisi Macro Score 72
        (Konstruktif) dan sinyal rotasi di atas. Pilih profil yang paling sesuai
        dengan toleransi risikomu.
      </p>

      <div className="mb-6">
        <InvestorStrategyCards />
      </div>

      {/* YTM Calculator */}
      <YTMCalculator />

      {/* Footer disclaimer */}
      <p className="mt-12 text-center text-[10.5px] leading-[1.7] text-grove-muted">
        Grove Compass bersifat edukatif dan diperbarui mingguan setiap Senin
        pagi. Bukan saran investasi personal. Setiap keputusan investasi
        <br />
        adalah tanggung jawab masing-masing investor.
      </p>
    </main>
  );
}
