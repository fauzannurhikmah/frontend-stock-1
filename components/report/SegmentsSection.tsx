"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { ResearchAsset } from "@/lib/types";
import { getReportFinancials } from "@/data/reportFinancials";

function parseNumber(value: string) {
  const num = Number.parseFloat(value.replace(/[^0-9.\-]/g, ""));
  return Number.isNaN(num) ? 0 : num;
}

export function SegmentsSection({ asset }: { asset: ResearchAsset }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { segs, is } = getReportFinancials(asset.ticker);

  const heading =
    asset.assetClass === "bonds"
      ? "Distribusi Komponen Return"
      : asset.assetClass === "mmf"
        ? "Alokasi Aset"
        : "Distribusi Segmen Operasi";
  const chartTtl =
    asset.assetClass === "bonds"
      ? "Kontribusi Return per Komponen"
      : asset.assetClass === "mmf"
        ? "Alokasi Aset — Breakdown"
        : "Kontribusi Revenue per Segmen — TTM";

  const activeSegment = segs?.[activeIndex];

  useEffect(() => {
    if (!canvasRef.current || !segs) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        labels: segs.map((seg) => seg.name),
        datasets: [
          {
            data: segs.map((seg) => seg.pct),
            backgroundColor: segs.map((seg) => `${seg.color}BB`),
            borderColor: segs.map((seg) => seg.color),
            borderWidth: 1.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${ctx.parsed}%`,
            },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [segs]);

  if (!segs || !is) {
    return (
      <div className="placeholder">
        <h3>Data segera tersedia</h3>
        <p>Breakdown segmen untuk {asset.ticker} sedang disiapkan.</p>
      </div>
    );
  }

  const cols = is.cols;
  const hasFc = cols[0] && /^FY \d+E$/.test(cols[0]);
  const detailRows = activeSegment?.rows ?? [];

  return (
    <section className="analysis-wrap">
      <div className="slbl" style={{ marginTop: 0 }}>
        {heading}
      </div>
      <div
        style={{
          background: "var(--bg2)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "10px",
        }}
      >
        <div className="ks-chart-ttl" style={{ marginBottom: "12px" }}>
          {chartTtl}
        </div>
        <div className="seg-chart-row">
          <div className="seg-donut-wrap">
            <canvas ref={canvasRef} />
          </div>
          <div className="seg-legend">
            {segs.map((seg, index) => (
              <div
                key={seg.name}
                className="seg-leg-item"
                style={{ opacity: index === activeIndex ? 1 : 0.6 }}
                onClick={() => setActiveIndex(index)}
              >
                <div
                  className="seg-leg-dot"
                  style={{ background: seg.color }}
                />
                <div>
                  <div className="seg-leg-name">{seg.name}</div>
                  <div className="seg-leg-meta">
                    <span className="seg-leg-pct">{seg.pct}% kontribusi</span>
                    <span
                      className={`seg-leg-grw ${
                        seg.growth.startsWith("+") ? "pos" : "neg"
                      }`}
                    >
                      {seg.growth}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="seg-cards">
        {segs.map((seg, index) => (
          <div
            key={seg.name}
            className={`seg-card ${index === activeIndex ? "active" : ""}`}
            onClick={() => setActiveIndex(index)}
          >
            <div className="seg-card-nm" style={{ color: seg.color }}>
              {seg.name}
            </div>
            <div className="seg-card-rev">{seg.rev}</div>
            <div
              className={`seg-card-grw ${
                seg.growth.startsWith("+") ? "pos" : "neg"
              }`}
            >
              {seg.growth}
            </div>
            <div
              style={{
                fontSize: "9px",
                color: "var(--muted)",
                marginTop: "2px",
              }}
            >
              {seg.pct}% kontribusi
            </div>
            <div className="seg-card-bar">
              <div
                className="seg-card-bar-f"
                style={{ width: `${seg.pct}%`, background: seg.color }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="slbl">Detail Kuartalan &amp; Proyeksi Segmen</div>
      <div className="seg-detail-wrap">
        <table className="is-tbl">
          <thead>
            <tr>
              <th style={{ color: activeSegment?.color }}>
                {activeSegment?.name ?? "-"}
              </th>
              {cols.map((col) => {
                const fc = /^FY \d+E$/.test(col);
                return (
                  <th key={col} className={fc ? "fc-col" : undefined}>
                    {col}
                    {fc ? " *" : ""}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {detailRows.map((row) => {
              let values = row.v.slice();
              if (hasFc && values.length < cols.length) {
                const quarters = values.slice(0, 4);
                let sum = 0;
                let hasNum = false;
                let suffix = "";
                quarters.forEach((value) => {
                  const num = parseNumber(value);
                  if (!Number.isNaN(num)) {
                    sum += num;
                    hasNum = true;
                  }
                  const match = value.match(/\s([TBM])$/);
                  if (match) {
                    suffix = ` ${match[1]}`;
                  }
                });
                const proj = hasNum
                  ? `${(sum * 1.08).toFixed(2)}${suffix}`
                  : "-";
                values = [proj, ...values];
              }
              return (
                <tr
                  key={row.l}
                  className={`${row.bold ? "is-bold" : ""} ${
                    row.hl ? "is-hl" : ""
                  } ${row.sub ? "is-sub" : ""} ${row.fc ? "fc-row" : ""}`}
                >
                  <td>{row.l}</td>
                  {values.map((value, index) => (
                    <td
                      key={`${row.l}-${index}`}
                      className={index === 0 && hasFc ? "fc-cell" : undefined}
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {asset.assetClass === "stocks" ||
      asset.assetClass === "us" ||
      asset.assetClass === "global" ? (
        <div className="fc-legend">
          <span className="fc-legend-mark">*</span> Kolom FY 2026E merupakan
          proyeksi kontribusi segmen oleh tim riset Grove berdasarkan
          ekstrapolasi tren kuartalan dan asumsi pertumbuhan baseline.
        </div>
      ) : null}
    </section>
  );
}
