"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { ResearchAsset } from "@/lib/types";
import { getReportFinancials, KsRow } from "@/data/reportFinancials";

type MetricId = "netIncome" | "eps" | "revenue";

const LABELS = {
  stocks: { netIncome: "Net Income", eps: "EPS", revenue: "Revenue" },
  us: { netIncome: "Net Income", eps: "EPS", revenue: "Revenue" },
  global: { netIncome: "Net Income", eps: "EPS", revenue: "Revenue" },
  bonds: {
    netIncome: "YTM Historis",
    eps: "Yield Snapshot",
    revenue: "Harga Pasar",
  },
  mmf: {
    netIncome: "Yield Tahunan",
    eps: "Ringkasan",
    revenue: "NAB per Unit",
  },
} as const;

const EXTRA_LABELS = {
  stocks: {
    mktCap: "Market Cap",
    ev: "Enterprise Value",
    shares: "Shares Outstanding",
    ff: "Free Float",
  },
  us: {
    mktCap: "Market Cap",
    ev: "Enterprise Value",
    shares: "Shares Outstanding",
    ff: "Free Float",
  },
  global: {
    mktCap: "Market Cap",
    ev: "Enterprise Value",
    shares: "Shares Outstanding",
    ff: "Free Float",
  },
  bonds: {
    mktCap: "Outstanding",
    ev: "Tipe",
    shares: "Issuer",
    ff: "Ownership",
  },
  mmf: {
    mktCap: "AUM",
    ev: "Jenis",
    shares: "Total Unit",
    ff: "Custody",
  },
} as const;

function isForecast(row: KsRow) {
  return row.fc || (row.p && /^FY \d+E$/.test(row.p));
}

function parseNumber(value: string | undefined) {
  if (!value) return 0;
  const num = Number.parseFloat(value.replace(/[^0-9.\-]/g, ""));
  return Number.isNaN(num) ? 0 : num;
}

export function KeyStatsSection({ asset }: { asset: ResearchAsset }) {
  const [activeMetric, setActiveMetric] = useState<MetricId>("netIncome");
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { ks } = getReportFinancials(asset.ticker);

  const labelSet = LABELS[asset.assetClass];
  const extraLabels = EXTRA_LABELS[asset.assetClass];
  const showPE =
    asset.assetClass === "stocks" ||
    asset.assetClass === "us" ||
    asset.assetClass === "global";

  const activeRows = useMemo(() => {
    if (!ks) return [] as KsRow[];
    return ks[activeMetric] ?? ks.netIncome;
  }, [activeMetric, ks]);

  const chartRows = useMemo(
    () =>
      activeRows.filter(
        (row) =>
          row.p &&
          (row.p.startsWith("Q") ||
            row.p.startsWith("Apr") ||
            (row.p.startsWith("FY") &&
              !row.p.includes("2023") &&
              !row.p.includes("2024"))),
      ),
    [activeRows],
  );

  useEffect(() => {
    if (!canvasRef.current || chartRows.length === 0) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const values = chartRows.map((row) => parseNumber(row.v));
    const colors = chartRows.map((row) =>
      isForecast(row) ? "rgba(95,184,138,0.55)" : "rgba(95,184,138,0.22)",
    );
    const borders = chartRows.map(() => "#5FB88A");
    const borderWidths = chartRows.map((row) => (isForecast(row) ? 2 : 1.5));

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: chartRows.map((row) => row.p),
        datasets: [
          {
            data: values,
            backgroundColor: colors,
            borderColor: borders,
            borderWidth: borderWidths,
            borderRadius: 5,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${(ctx.parsed.y ?? 0).toLocaleString()}`,
              afterLabel: (ctx) =>
                isForecast(chartRows[ctx.dataIndex]) ? "(Proyeksi Grove)" : "",
            },
          },
        },
        scales: {
          x: {
            ticks: { color: "#6B7F72", font: { size: 10, family: "Inter" } },
            grid: { display: false },
          },
          y: {
            ticks: { color: "#6B7F72", font: { size: 10, family: "Inter" } },
            grid: { color: "rgba(255,255,255,0.03)" },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [chartRows]);

  if (!ks) {
    return (
      <div className="placeholder">
        <h3>Data segera tersedia</h3>
        <p>
          Grove sedang menyiapkan riset mendalam untuk {asset.ticker}. Sementara
          itu, bagian Analisis &amp; Penilaian sudah lengkap.
        </p>
      </div>
    );
  }

  const title = `${labelSet[activeMetric]} — Trend Kuartalan & Proyeksi`;
  const valHdr =
    asset.assetClass === "bonds" || asset.assetClass === "mmf"
      ? "Nilai"
      : "Nilai (IDR)";
  const grHdr =
    asset.assetClass === "bonds" || asset.assetClass === "mmf"
      ? "Perubahan"
      : "Growth YoY";

  return (
    <section className="analysis-wrap">
      <div className="slbl" style={{ marginTop: 0 }}>
        Ringkasan
        {asset.assetClass === "bonds"
          ? " Instrumen"
          : asset.assetClass === "mmf"
            ? " Produk"
            : " Valuasi"}
      </div>
      <div className="ks-extra">
        <div className="ks-ext-item">
          <div className="ks-ext-lbl">{extraLabels.mktCap}</div>
          <div className="ks-ext-val">{ks.extra.mktCap}</div>
        </div>
        <div className="ks-ext-item">
          <div className="ks-ext-lbl">{extraLabels.ev}</div>
          <div className="ks-ext-val">{ks.extra.ev}</div>
        </div>
        <div className="ks-ext-item">
          <div className="ks-ext-lbl">{extraLabels.shares}</div>
          <div className="ks-ext-val">{ks.extra.shares}</div>
        </div>
        <div className="ks-ext-item">
          <div className="ks-ext-lbl">{extraLabels.ff}</div>
          <div className="ks-ext-val">{ks.extra.ff}</div>
        </div>
      </div>

      {showPE && (ks.extra.peTTM || ks.extra.pe26) ? (
        <div className="ks-extra" style={{ marginTop: "-4px" }}>
          <div className="ks-ext-item">
            <div className="ks-ext-lbl">PE (TTM)</div>
            <div className="ks-ext-val">{ks.extra.peTTM ?? "-"}</div>
          </div>
          <div className="ks-ext-item">
            <div className="ks-ext-lbl">
              PE FY 2026E <span className="fc-asterisk">*</span>
            </div>
            <div className="ks-ext-val" style={{ color: "var(--grove)" }}>
              {ks.extra.pe26 ?? "-"}
            </div>
          </div>
          <div className="ks-ext-item">
            <div className="ks-ext-lbl">PE Avg 5Y (Ref)</div>
            <div className="ks-ext-val">-</div>
          </div>
          <div className="ks-ext-item">
            <div className="ks-ext-lbl">Posisi vs Avg</div>
            <div
              className="ks-ext-val"
              style={{ color: "var(--muted2)", fontSize: "13px" }}
            >
              Reference
            </div>
          </div>
        </div>
      ) : null}

      <div className="slbl">Data Per Kuartal &amp; Proyeksi</div>
      <div className="ks-metric-tabs">
        {(Object.keys(labelSet) as MetricId[]).map((metricId) => (
          <button
            key={metricId}
            className={`ks-mtab ${activeMetric === metricId ? "active" : ""}`}
            onClick={() => setActiveMetric(metricId)}
            type="button"
          >
            {labelSet[metricId]}
          </button>
        ))}
      </div>
      <div className="ks-chart-box">
        <div className="ks-chart-ttl">{title}</div>
        <div className="chart-h">
          <canvas ref={canvasRef} />
        </div>
      </div>
      <div className="ks-tbl-wrap">
        <div className="ks-row hdr">
          <span>Periode</span>
          <span style={{ textAlign: "right" }}>{valHdr}</span>
          <span style={{ textAlign: "right" }}>{grHdr}</span>
        </div>
        {activeRows.map((row) => {
          if (row.p === "divider") {
            return (
              <div key={`div-${row.label}`} className="ks-divider">
                <span>{row.label}</span>
              </div>
            );
          }

          const forecast = isForecast(row);
          return (
            <div
              key={`${row.p}-${row.v}`}
              className={`ks-row ${row.bold ? "bold" : ""} ${
                forecast ? "fc-row" : ""
              }`}
            >
              <span className="ks-period">
                {forecast ? (
                  <>
                    {row.p} <span className="fc-asterisk">*</span>
                  </>
                ) : (
                  row.p
                )}
              </span>
              <span className="ks-val">{row.v ?? "-"}</span>
              <span
                className={`ks-grow ${row.g ? (row.pos ? "pos" : "neg") : ""}`}
              >
                {row.g ?? "-"}
              </span>
            </div>
          );
        })}
      </div>
      <div className="fc-legend">
        <span className="fc-legend-mark">*</span> Proyeksi FY 2026E adalah
        estimasi internal tim riset Grove berdasarkan tren kuartalan, konsensus
        pasar, dan asumsi makro yang dapat berubah sewaktu-waktu.
      </div>
    </section>
  );
}
