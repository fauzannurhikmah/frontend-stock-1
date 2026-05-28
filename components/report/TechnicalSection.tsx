"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { COLOR_MAP } from "@/lib/research-utils";
import { ResearchAsset } from "@/lib/types";
import { technicalData } from "@/data/reportDetail";

const PHASE_COLORS = ["#22C97A", "#5FB88A", "#C8A84B", "#F0A030", "#E04848"];
const MONTHS = [
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
];

export function TechnicalSection({ asset }: { asset: ResearchAsset }) {
  const data = technicalData[asset.ticker] ?? technicalData.default;
  const accent = COLOR_MAP[asset.color] ?? "#5FB88A";
  const rsiValue = Number.parseInt(data.rsi, 10);
  const rsiTone =
    rsiValue > 70
      ? "var(--red)"
      : rsiValue < 35
        ? "var(--green)"
        : "var(--amber)";

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels: data.series.map((_, index) => MONTHS[index] ?? ""),
        datasets: [
          {
            label: asset.ticker,
            data: data.series,
            borderColor: accent,
            backgroundColor: `${accent}22`,
            borderWidth: 2,
            fill: true,
            tension: 0.3,
            pointRadius: 2,
            pointHoverRadius: 4,
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
            },
          },
        },
        scales: {
          x: {
            ticks: { color: "#6B7F72", font: { size: 9 } },
            grid: { color: "rgba(255,255,255,0.03)" },
          },
          y: {
            ticks: { color: "#6B7F72", font: { size: 9 } },
            grid: { color: "rgba(255,255,255,0.03)" },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [accent, asset.ticker, data.series]);

  return (
    <section className="tek-wrap">
      <div className="tek-wyckoff">
        <div className="tek-wyckoff-title">
          Analisis Wyckoff — Posisi Siklus Saat Ini
        </div>
        <div className="tek-wyckoff-sub">
          Framework Wyckoff Market Cycle Analysis · Data Apr 2026
        </div>

        <div className="wyckoff-phase-bar">
          {data.phases.map((phase, index) => {
            const isCurrent = index === data.phase;
            const color = PHASE_COLORS[index % PHASE_COLORS.length];
            return (
              <div
                key={phase}
                className={`wyckoff-phase ${isCurrent ? "current" : ""}`}
                style={{
                  background: `${color}${isCurrent ? "EE" : "44"}`,
                  color: isCurrent ? "#0A0E0B" : "rgba(255,255,255,0.5)",
                }}
              >
                {phase}
              </div>
            );
          })}
        </div>
        <div className="wyckoff-labels">
          {data.phases.map((_, index) => (
            <div
              key={`wlbl-${index}`}
              className={`wlbl ${index === data.phase ? "active" : ""}`}
            >
              {index === data.phase ? "◉ Sekarang" : ""}
            </div>
          ))}
        </div>

        <div className="tek-indicators">
          <div className="tek-ind">
            <div className="tek-ind-lbl">RSI (14)</div>
            <div className="tek-ind-val" style={{ color: rsiTone }}>
              {data.rsi}
            </div>
            <div className="tek-ind-sig" style={{ color: rsiTone }}>
              {rsiValue > 70
                ? "Overbought"
                : rsiValue < 35
                  ? "Oversold"
                  : "Netral"}
            </div>
          </div>
          <div className="tek-ind">
            <div className="tek-ind-lbl">MA 50 harian</div>
            <div className="tek-ind-val" style={{ fontSize: "12px" }}>
              {data.ma50}
            </div>
            <div className="tek-ind-sig" style={{ color: "var(--muted2)" }}>
              Moving Average
            </div>
          </div>
          <div className="tek-ind">
            <div className="tek-ind-lbl">MA 200 harian</div>
            <div className="tek-ind-val" style={{ fontSize: "12px" }}>
              {data.ma200}
            </div>
            <div className="tek-ind-sig" style={{ color: "var(--muted2)" }}>
              Long Term Avg
            </div>
          </div>
          <div className="tek-ind">
            <div className="tek-ind-lbl">Volume/Hari</div>
            <div className="tek-ind-val" style={{ fontSize: "12px" }}>
              {data.vol}
            </div>
            <div className="tek-ind-sig" style={{ color: "var(--grove)" }}>
              Avg 30 hari
            </div>
          </div>
        </div>

        <div className="tek-chart-wrap">
          <div className="tek-chart-ttl">
            Ilustrasi Price Action — Wyckoff Phase Mapping
          </div>
          <div style={{ position: "relative", height: "200px", width: "100%" }}>
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={`Wyckoff price action chart for ${asset.ticker}`}
            />
          </div>
        </div>

        <div className="tek-analysis-rows">
          {data.analysis.map((item) => (
            <div key={item} className="tek-row">
              <div
                className="tek-row-ico"
                style={{ background: "var(--grove)" }}
              />
              <div
                className="tek-row-txt"
                dangerouslySetInnerHTML={{ __html: item }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="disc">
        Analisis teknikal Wyckoff ini bersifat ilustratif dan disusun tim riset
        Grove berdasarkan data historis. Bukan merupakan sinyal trading. Past
        price action tidak menjamin pergerakan di masa depan.
      </div>
    </section>
  );
}
