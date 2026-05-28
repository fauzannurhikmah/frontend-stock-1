"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ReportHeader } from "@/components/report/ReportHeader";
import { ReportNav } from "@/components/report/ReportNav";
import { KeyStatsSection } from "@/components/report/KeyStatsSection";
import { IncomeStatementTable } from "@/components/report/IncomeStatementTable";
import { SegmentsSection } from "@/components/report/SegmentsSection";
import { AnalysisSection } from "@/components/report/AnalysisSection";
import { BandarmologySection } from "@/components/report/BandarmologySection";
import { NarasiSection } from "@/components/report/NarasiSection";
import { TechnicalSection } from "@/components/report/TechnicalSection";
import { researchAssets } from "@/data/researchData";
import { ResearchAsset } from "@/lib/types";

type ReportTab = {
  id: string;
  label: string;
  accent?: boolean;
};

const assetClassLabels: Record<ResearchAsset["assetClass"], string> = {
  stocks: "Saham Indonesia",
  us: "Saham Amerika",
  global: "Saham Global",
  bonds: "Obligasi",
  mmf: "Reksadana/ETF",
};

const stanceLabels: Record<"ow" | "nt" | "uw", string> = {
  ow: "Overweight",
  nt: "Neutral",
  uw: "Underweight",
};

export function ReportClient({ ticker }: { ticker: string }) {
  const [tab, setTab] = useState("analysis");
  const asset = useMemo(
    () => researchAssets.find((item) => item.ticker === ticker.toUpperCase()),
    [ticker],
  );

  const tabs: ReportTab[] = useMemo(() => {
    const baseTabs = [
      { id: "analysis", label: "Analisis & Penilaian" },
      { id: "narasi", label: "Narasi & Follow-up", accent: true },
      {
        id: "keystats",
        label:
          asset?.assetClass === "bonds"
            ? "Yield & Duration"
            : asset?.assetClass === "mmf"
              ? "NAB & Yield"
              : "Key Statistics",
      },
      {
        id: "income",
        label:
          asset?.assetClass === "bonds"
            ? "Karakteristik & Return"
            : asset?.assetClass === "mmf"
              ? "Return & Biaya"
              : "Laporan Keuangan",
      },
      {
        id: "segments",
        label:
          asset?.assetClass === "bonds"
            ? "Komponen Return"
            : asset?.assetClass === "mmf"
              ? "Alokasi Aset"
              : "Segmen Operasi",
      },
      { id: "teknikal", label: "Analisis Teknikal" },
    ];

    if (asset?.assetClass === "stocks") {
      baseTabs.push({ id: "bandar", label: "Bandarmology" });
    }

    return baseTabs;
  }, [asset]);

  if (!asset) {
    return (
      <main className="container-shell py-7 animate-fadeUp">
        <Link
          href="/research"
          className="mb-5 inline-flex items-center gap-2 text-[11px] text-grove-muted2"
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
          Kembali ke Dashboard
        </Link>
        <div className="rounded-grove-2 border border-grove-border bg-grove-bg2 p-6 text-center">
          <h2 className="font-serif text-[20px]">Data belum tersedia</h2>
          <p className="mt-2 text-[12px] text-grove-muted2">
            Ticker {ticker.toUpperCase()} belum ada di daftar riset Grove.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container-shell py-7 animate-fadeUp">
      <Link
        href="/research"
        className="mb-5 inline-flex items-center gap-2 text-[11px] text-grove-muted2"
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
        Kembali ke Dashboard
      </Link>
      <ReportHeader
        asset={asset}
        assetClassLabel={assetClassLabels[asset.assetClass]}
      />
      <div className="mb-4 grid gap-2 md:grid-cols-3">
        {(["lt", "mt", "st"] as const).map((hz) => {
          const data = asset[hz];
          return (
            <div
              key={hz}
              className="rounded-grove border border-grove-border bg-grove-bg2 px-3 py-3 text-center"
            >
              <div className="text-[9px] uppercase tracking-[.08em] text-grove-muted">
                {hz === "lt"
                  ? "Long Term"
                  : hz === "mt"
                    ? "Medium Term"
                    : "Short Term"}
              </div>
              <div className="mt-2 text-[11px] font-semibold text-grove-primary">
                {stanceLabels[data.stance]}
              </div>
              <div className="mt-1 text-[10px] text-grove-muted2">
                Prob+ {data.prob}% · EV {data.ev}
              </div>
            </div>
          );
        })}
      </div>

      <ReportNav value={tab} onChange={setTab} tabs={tabs} />

      {tab === "analysis" && <AnalysisSection asset={asset} />}
      {tab === "narasi" && <NarasiSection ticker={asset.ticker} />}
      {tab === "keystats" && <KeyStatsSection asset={asset} />}
      {tab === "income" && <IncomeStatementTable asset={asset} />}
      {tab === "segments" && <SegmentsSection asset={asset} />}
      {tab === "teknikal" && <TechnicalSection asset={asset} />}
      {tab === "bandar" && asset.assetClass === "stocks" && (
        <BandarmologySection ticker={asset.ticker} />
      )}
    </main>
  );
}
