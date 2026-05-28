"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import {
  getTrackerCounts,
  trackerChart,
  trackerData,
  trackerStats,
  type TrackerStatus,
} from "@/data/trackRecordData";

const filterLabels: Array<{ id: TrackerStatus | "all"; label: string }> = [
  { id: "all", label: "Semua" },
  { id: "open", label: "Terbuka" },
  { id: "closed-win", label: "Closed Profit" },
  { id: "closed-loss", label: "Closed Loss" },
];

const statusLabel: Record<TrackerStatus, string> = {
  open: "Terbuka",
  "closed-win": "Closed +",
  "closed-loss": "Closed −",
};

function statusStyles(status: TrackerStatus) {
  if (status === "open") {
    return {
      background: "rgba(58,158,232,.12)",
      color: "var(--blue)",
    };
  }
  if (status === "closed-win") {
    return {
      background: "rgba(34,201,122,.12)",
      color: "var(--green)",
    };
  }
  return {
    background: "rgba(224,72,72,.12)",
    color: "var(--red)",
  };
}

function statToneStyles(tone: "green" | "grove" | "text" | "red") {
  if (tone === "green") return { color: "var(--green)" };
  if (tone === "grove") return { color: "var(--grove)" };
  if (tone === "red") return { color: "var(--red)" };
  return { color: "var(--text)" };
}

export function TrackRecordClient() {
  const [activeFilter, setActiveFilter] = useState<TrackerStatus | "all">(
    "all",
  );
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const counts = useMemo(() => getTrackerCounts(), []);

  const filteredRows = useMemo(() => {
    if (activeFilter === "all") return trackerData;
    if (activeFilter === "open")
      return trackerData.filter((item) => item.status === "open");
    if (activeFilter === "closed-win")
      return trackerData.filter((item) => item.status === "closed-win");
    return trackerData.filter((item) => item.status === "closed-loss");
  }, [activeFilter]);

  useEffect(() => {
    if (!chartCanvasRef.current) return;

    chartInstanceRef.current?.destroy();

    chartInstanceRef.current = new Chart(chartCanvasRef.current, {
      type: "line",
      data: {
        labels: trackerChart.labels as unknown as string[],
        datasets: [
          {
            label: "Grove",
            data: trackerChart.grove as unknown as number[],
            borderColor: "#5FB88A",
            backgroundColor: "rgba(95,184,138,.08)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4,
          },
          {
            label: "IHSG",
            data: trackerChart.ihsg as unknown as number[],
            borderColor: "rgba(107,127,114,.5)",
            backgroundColor: "transparent",
            borderWidth: 1.5,
            borderDash: [5, 4],
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                ` ${ctx.dataset.label}: ${(ctx.parsed.y ?? 0).toFixed(0)}`,
            },
          },
        },
        scales: {
          x: {
            ticks: { color: "#6B7F72", font: { size: 9 }, maxTicksLimit: 8 },
            grid: { display: false },
          },
          y: {
            ticks: { color: "#6B7F72", font: { size: 9 } },
            grid: { color: "rgba(255,255,255,.04)" },
            min: 95,
          },
        },
      },
    });

    return () => {
      chartInstanceRef.current?.destroy();
      chartInstanceRef.current = null;
    };
  }, []);

  return (
    <main className="portfolio-page tracker-page">
      <div className="port-hero tracker-hero">
        <h1>
          Grove <em>Model Portfolio</em>
        </h1>
        <p>
          Simulasi portofolio yang mengikuti setiap rekomendasi riset Grove
          sejak Januari 2024 — disajikan transparan, termasuk posisi yang rugi.
        </p>
        <div className="tracker-inception">
          <span className="live-dot" style={{ width: 5, height: 5 }} />
          Inception: Jan 2024 · Modal awal simulasi: Rp 500 juta
        </div>
      </div>

      <div className="tracker-stats">
        {trackerStats.map((item) => (
          <article key={item.label} className="tracker-stat !rounded-lg">
            <div className="tracker-stat-label">{item.label}</div>
            <div
              className="tracker-stat-value"
              style={statToneStyles(item.tone)}
            >
              {item.value}
            </div>
            <div className="tracker-stat-sub">{item.sub}</div>
          </article>
        ))}
      </div>

      <section className="tracker-chart-card !rounded-lg">
        <div className="tracker-chart-head">
          <div>
            <div className="tracker-kicker">Kurva Performa</div>
            <div className="tracker-subhead">
              Grove Model Portfolio vs IHSG — basis 100
            </div>
          </div>
          <div className="tracker-chart-legend">
            <span>
              <span className="tracker-line grove" />
              Grove Portfolio
            </span>
            <span>
              <span className="tracker-line ihsg" />
              IHSG
            </span>
          </div>
        </div>
        <div style={{ position: "relative", height: 220 }}>
          <canvas ref={chartCanvasRef} id="tracker-chart" />
        </div>
      </section>

      <div className="tracker-section-title">
        Riwayat <i>Semua Posisi</i>
      </div>
      <div className="tracker-section-sub">
        Setiap posisi — termasuk yang rugi — ditampilkan lengkap dengan thesis
        original dan outcome-nya.
      </div>

      <div className="tracker-filter-row">
        {filterLabels.map((filter) => {
          const isActive = activeFilter === filter.id;
          const count =
            filter.id === "all"
              ? counts.all
              : filter.id === "open"
                ? counts.open
                : filter.id === "closed-win"
                  ? counts.win
                  : counts.loss;

          return (
            <button
              key={filter.id}
              type="button"
              className="trk-tab"
              onClick={() => setActiveFilter(filter.id)}
              style={
                isActive
                  ? {
                      padding: "5px 14px",
                      borderRadius: "999px",
                      border: "1px solid rgba(95,184,138,.4)",
                      background: "rgba(95,184,138,.12)",
                      color: "var(--grove)",
                      fontSize: 11,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }
                  : {
                      padding: "5px 14px",
                      borderRadius: "999px",
                      border: "1px solid var(--border)",
                      background: "transparent",
                      color: "var(--muted2)",
                      fontSize: 11,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }
              }
            >
              {filter.label} ({count})
            </button>
          );
        })}
      </div>

      <section className="tracker-table-shell !rounded-lg">
        <div className="tracker-table-head">
          <div>Emiten</div>
          <div>Thesis saat entry</div>
          <div style={{ textAlign: "right" }}>Entry</div>
          <div style={{ textAlign: "right" }}>Harga kini</div>
          <div style={{ textAlign: "right" }}>Return</div>
          <div style={{ textAlign: "center" }}>Status</div>
        </div>
        <div className="tracker-rows">
          {filteredRows.map((item) => {
            const badgeColor = item.color;
            const retColor = item.pos ? "var(--green)" : "var(--red)";
            const abbr = item.ticker.slice(0, 3).replace(/[^A-Z]/g, "");
            const currentColor =
              item.status === "closed-loss" ? "var(--muted2)" : "var(--text)";

            return (
              <div key={item.ticker} className="tracker-row">
                <div className="tracker-emitter">
                  <div
                    className="tracker-badge"
                    style={{ background: `${badgeColor}22`, color: badgeColor }}
                  >
                    {abbr}
                  </div>
                  <div className="tracker-emitter-meta">
                    <div className="tracker-ticker">{item.ticker}</div>
                    <div className="tracker-sector">{item.sector}</div>
                  </div>
                </div>
                <div className="tracker-thesis">{item.thesis}</div>
                <div className="tracker-entry">
                  <div className="tracker-entry-value">{item.entry}</div>
                  <div className="tracker-entry-date">{item.entryDate}</div>
                </div>
                <div
                  className="tracker-current"
                  style={{ color: currentColor }}
                >
                  {item.current}
                </div>
                <div className="tracker-return" style={{ color: retColor }}>
                  {item.ret}
                </div>
                <div className="tracker-status-wrap">
                  <span
                    className="tracker-status"
                    style={statusStyles(item.status)}
                  >
                    {statusLabel[item.status]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="tracker-disclaimer !rounded-lg">
        <div className="tracker-disclaimer-kicker">
          Transparansi & Metodologi
        </div>
        <div className="tracker-disclaimer-body">
          Grove Model Portfolio adalah{" "}
          <strong className="text-white">simulasi edukatif murni</strong> —
          bukan portofolio nyata, bukan uang sesungguhnya. Modal awal fiktif Rp
          500 juta dialokasikan mengikuti setiap rekomendasi Grove sejak Januari
          2024 secara konsisten, tanpa backfilling atau perubahan retroaktif.
          Setiap posisi dicatat pada tanggal rekomendasi pertama dipublikasikan
          dengan harga penutupan hari tersebut. Posisi rugi ditampilkan sama
          prominennya dengan yang untung — karena tujuannya adalah membuktikan{" "}
          <strong className="text-white">kualitas framework riset</strong>,
          bukan hanya menampilkan winner. Simulasi ini bukan saran investasi dan
          tidak menjamin performa di masa mendatang.
        </div>
      </section>
    </main>
  );
}
