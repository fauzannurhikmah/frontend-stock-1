"use client";

import { useState } from "react";

type Trend = "up" | "down" | "neutral";
type DimItem = {
  title: string;
  score: number;
  trend: Trend;
  metrics: Array<{ label: string; value: string; trend: Trend }>;
  narrativeLink: string;
};

const macroDimensions: DimItem[] = [
  {
    title: "Global Rate & Liquidity",
    score: 78,
    trend: "up",
    metrics: [
      { label: "Fed Funds", value: "4.25–4.50%", trend: "down" },
      { label: "DXY", value: "102.4", trend: "down" },
      { label: "US 10Y", value: "4.18%", trend: "neutral" },
    ],
    narrativeLink: "#",
  },
  {
    title: "Domestic Rate & Currency",
    score: 74,
    trend: "down",
    metrics: [
      { label: "BI Rate", value: "5.50%", trend: "down" },
      { label: "USD/IDR", value: "16,180", trend: "neutral" },
      { label: "Cadev", value: "$156B", trend: "up" },
    ],
    narrativeLink: "#",
  },
  {
    title: "Growth & Activity",
    score: 68,
    trend: "up",
    metrics: [
      { label: "GDP Indonesia", value: "5.1%", trend: "up" },
      { label: "PMI", value: "51.8", trend: "up" },
      { label: "Consumer Conf", value: "116", trend: "neutral" },
    ],
    narrativeLink: "#",
  },
  {
    title: "Inflation & Fiscal",
    score: 64,
    trend: "down",
    metrics: [
      { label: "CPI YoY", value: "2.8%", trend: "down" },
      { label: "Core CPI", value: "2.4%", trend: "neutral" },
      { label: "Deficit", value: "2.5% GDP", trend: "neutral" },
    ],
    narrativeLink: "#",
  },
  {
    title: "Market Sentiment",
    score: 80,
    trend: "up",
    metrics: [
      { label: "IHSG YTD", value: "+4.2%", trend: "up" },
      { label: "Foreign Flow", value: "+Rp 3.2T", trend: "up" },
      { label: "VIX", value: "14.8", trend: "neutral" },
    ],
    narrativeLink: "#",
  },
];

function scoreColor(s: number) {
  if (s >= 75) return "text-[#4ecb8d]";
  if (s >= 60) return "text-[#e8a84c]";
  return "text-[#e05c5c]";
}

function TrendIcon({ t }: { t: Trend }) {
  if (t === "up") return <span className="text-current"> ↑</span>;
  if (t === "down") return <span className="text-current"> ↓</span>;
  return <span className="text-current"> ●</span>;
}

function metricValueColor(t: Trend, label: string) {
  if (label === "Deficit") return "text-[#e8a84c]";
  if (
    [
      "Fed Funds",
      "DXY",
      "BI Rate",
      "Cadev",
      "PMI",
      "CPI YoY",
      "IHSG YTD",
      "Foreign Flow",
    ].includes(label)
  ) {
    return "text-[#4ecb8d]";
  }
  if (t === "up") return "text-[#4ecb8d]";
  if (t === "down") return "text-grove-text";
  return "text-grove-text";
}

export function MacroDimensionCards({
  onOpen,
}: {
  onOpen?: (idx: number) => void;
}) {
  const [active, setActive] = useState<number | null>(null);
  return (
    <div className="macro-dim-grid mb-6 grid gap-2 [grid-template-columns:repeat(1,minmax(0,1fr))] sm:[grid-template-columns:repeat(2,minmax(0,1fr))] md:[grid-template-columns:repeat(3,minmax(0,1fr))] lg:[grid-template-columns:repeat(5,minmax(0,1fr))]">
      {macroDimensions.map((item, i) => (
        <article
          key={item.title}
          onClick={() => {
            setActive(active === i ? null : i);
            if (onOpen) onOpen(i);
          }}
          className={`macro-dim-card cursor-pointer rounded-[10px] border border-grove-border bg-grove-bg2 p-[14px] transition-all hover:border-[rgba(95,184,138,0.4)] hover:bg-grove-bg3 hover:-translate-y-[2px] ${
            i === 4
              ? "sm:col-span-2 md:col-span-2 md:col-start-2 lg:col-span-1 lg:col-start-auto"
              : ""
          }`}
        >
          <div className="flex min-h-[32px] items-start justify-start">
            <p className="text-[11px] font-medium leading-[1.35] tracking-[-0.005em] text-grove-text">
              {item.title}
            </p>
          </div>
          <p
            className={`mb-2.5 font-serif text-[32px] font-medium leading-none tracking-[-0.02em] ${scoreColor(
              item.score,
            )}`}
          >
            {item.score}
            <span className="ml-0.5 text-[11px] font-normal text-grove-muted">
              /100
            </span>
          </p>
          <div className="mb-2.5 mt-2.5 space-y-1 border-t border-grove-border pt-2.5">
            {item.metrics.map((m) => (
              <div key={m.label} className="flex items-center justify-between">
                <span className="text-[10.5px] text-grove-muted2">
                  {m.label}
                </span>
                <span
                  className={`text-[10.5px] font-mono font-medium ${metricValueColor(
                    m.trend,
                    m.label,
                  )}`}
                >
                  {m.value}
                  <TrendIcon t={m.trend} />
                </span>
              </div>
            ))}
          </div>
          <p className="mt-auto pt-2 text-[9px] tracking-[0.05em] text-[#4ecb8d] opacity-80">
            Klik untuk narasi & berita →
          </p>
        </article>
      ))}
    </div>
  );
}
