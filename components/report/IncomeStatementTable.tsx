"use client";

import { useEffect, useMemo, useRef } from "react";
import Chart from "chart.js/auto";
import { ResearchAsset } from "@/lib/types";
import { getReportFinancials } from "@/data/reportFinancials";

function parseNumber(value: string) {
  const num = Number.parseFloat(value.replace(/[^0-9.\-]/g, ""));
  return Number.isNaN(num) ? 0 : num;
}

export function IncomeStatementTable({ asset }: { asset: ResearchAsset }) {
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { is } = getReportFinancials(asset.ticker);

  const showFcLegend =
    asset.assetClass === "stocks" ||
    asset.assetClass === "us" ||
    asset.assetClass === "global";

  const chartTitle =
    asset.assetClass === "bonds"
      ? "Harga & Yield — Trend Kuartalan"
      : asset.assetClass === "mmf"
        ? "NAB & Yield — Trend Kuartalan"
        : "Revenue & Laba Bersih — Trend Kuartalan & Proyeksi";

  const chartRows = useMemo(() => {
    if (!is) return { rev: undefined, lb: undefined };
    if (asset.assetClass === "bonds") {
      return {
        rev: is.rows.find((row) => row.l.includes("Harga")),
        lb: is.rows.find((row) => row.l.includes("Yield to Maturity")),
      };
    }
    if (asset.assetClass === "mmf") {
      return {
        rev: is.rows.find(
          (row) => row.l.includes("NAB") || row.l.includes("Harga"),
        ),
        lb: is.rows.find(
          (row) => row.l.includes("Yield") && !row.l.includes("Biaya"),
        ),
      };
    }
    return {
      rev: is.rows.find(
        (row) => row.l === "Total Pendapatan" || row.l === "Revenue",
      ),
      lb: is.rows.find(
        (row) =>
          row.l === "Laba Bersih Tahun Berjalan" || row.l === "Net Income",
      ),
    };
  }, [asset.assetClass, is]);

  useEffect(() => {
    if (!canvasRef.current || !is || !chartRows.rev || !chartRows.lb) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const labelsRev = is.cols.slice().reverse();
    const revDataRev = chartRows.rev.v.slice().reverse().map(parseNumber);
    const lbDataRev = chartRows.lb.v.slice().reverse().map(parseNumber);
    const fcIdxRev = labelsRev.map((label) => /^FY \d+E$/.test(label));
    const revColors = fcIdxRev.map((fc) =>
      fc ? "rgba(58,158,232,0.45)" : "rgba(58,158,232,0.22)",
    );
    const lbColors = fcIdxRev.map((fc) =>
      fc ? "rgba(95,184,138,0.55)" : "rgba(95,184,138,0.25)",
    );

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: labelsRev,
        datasets: [
          {
            label: chartRows.rev.l,
            data: revDataRev,
            backgroundColor: revColors,
            borderColor: "#3A9EE8",
            borderWidth: 1.5,
            borderRadius: 4,
            borderSkipped: false,
          },
          {
            label: chartRows.lb.l,
            data: lbDataRev,
            backgroundColor: lbColors,
            borderColor: "#5FB88A",
            borderWidth: 1.5,
            borderRadius: 4,
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
              afterLabel: (ctx) =>
                fcIdxRev[ctx.dataIndex] ? "(Proyeksi Grove)" : "",
            },
          },
        },
        scales: {
          x: {
            ticks: { color: "#6B7F72", font: { size: 10 } },
            grid: { display: false },
          },
          y: {
            ticks: { color: "#6B7F72", font: { size: 10 } },
            grid: { color: "rgba(255,255,255,0.03)" },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [asset.assetClass, chartRows, is]);

  if (!is) {
    return (
      <div className="placeholder">
        <h3>Data segera tersedia</h3>
        <p>Laporan keuangan detail untuk {asset.ticker} sedang disiapkan.</p>
      </div>
    );
  }

  const firstColForecast = is.cols[0] && /^FY \d+E$/.test(is.cols[0]);
  const firstColLabel =
    asset.assetClass === "bonds" || asset.assetClass === "mmf"
      ? "Metrik"
      : "Dalam Miliar IDR";

  return (
    <section className="analysis-wrap">
      <div className="is-chart-box">
        <div className="is-chart-ttl">{chartTitle}</div>
        <div className="is-chart-legend">
          <div className="is-leg-item">
            <div className="is-leg-dot" style={{ background: "#3A9EE8" }} />
            {asset.assetClass === "bonds"
              ? "Harga"
              : asset.assetClass === "mmf"
                ? "NAB"
                : "Total Pendapatan"}
          </div>
          <div className="is-leg-item">
            <div className="is-leg-dot" style={{ background: "#5FB88A" }} />
            {asset.assetClass === "bonds" || asset.assetClass === "mmf"
              ? "Yield (%)"
              : "Laba Bersih"}
          </div>
          {showFcLegend ? (
            <div className="is-leg-item" style={{ marginLeft: "auto" }}>
              <div
                className="is-leg-dot"
                style={{
                  background: "#5FB88A",
                  opacity: 0.5,
                  border: "1.5px solid #5FB88A",
                }}
              />
              Proyeksi FY 2026E *
            </div>
          ) : null}
        </div>
        <div className="chart-h">
          <canvas ref={canvasRef} />
        </div>
      </div>

      <div className="is-tbl-wrap">
        <table className="is-tbl">
          <thead>
            <tr>
              <th>{firstColLabel}</th>
              {is.cols.map((col) => {
                const fc = /^FY \d+E$/.test(col);
                return (
                  <th
                    key={col}
                    style={fc ? { color: "var(--grove)" } : undefined}
                  >
                    {col}
                    {fc ? <span className="fc-asterisk">*</span> : null}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {is.rows.map((row) => (
              <tr
                key={row.l}
                className={`${row.bold ? "is-bold" : ""} ${
                  row.hl ? "is-hl" : ""
                } ${row.neg ? "is-neg" : ""} ${row.sub ? "is-sub" : ""} ${
                  row.fc ? "fc-row" : ""
                }`}
              >
                <td>{row.l}</td>
                {row.v.map((value, index) => (
                  <td
                    key={`${row.l}-${index}`}
                    className={
                      index === 0 && firstColForecast ? "fc-cell" : undefined
                    }
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showFcLegend ? (
        <div className="fc-legend">
          <span className="fc-legend-mark">*</span> Kolom dan baris bertanda
          asterisk merupakan proyeksi FY 2026E oleh tim riset Grove. Angka
          tersebut bersifat estimasi, bukan data historis, dan dapat direvisi
          seiring berjalannya periode.
        </div>
      ) : null}
    </section>
  );
}
