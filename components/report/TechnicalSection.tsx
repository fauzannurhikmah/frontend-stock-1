"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { API_BASE_URL } from "@/lib/env";
import { COLOR_MAP } from "@/lib/research-utils";
import { ResearchAsset } from "@/lib/types";

type TechnicalSeriesPoint = {
  date: string;
  close: string;
  volume: string;
  ma50: string | null;
  ma200: string | null;
  rsi14: string | null;
};

type TechnicalSeriesResponse = {
  listing?: {
    id?: string;
    symbol?: string;
  };
  meta?: {
    range?: string;
    interval?: string;
    points?: number;
  };
  series?: TechnicalSeriesPoint[];
};

type TechnicalSummaryResponse = {
  listing?: {
    id?: string;
    symbol?: string;
  };
  company?: {
    id?: string;
    legalName?: string;
    displayName?: string;
  };
  meta?: {
    period?: {
      range?: string;
      interval?: string;
      from?: string;
      to?: string;
      points?: number;
    };
  };
  overview?: {
    snapshot?: {
      date?: string;
      close?: string;
      change?: string;
      changePct?: string;
      volume?: string;
    };
    indicators?: {
      ma50?: string;
      ma200?: string;
      rsi14?: string;
      avgVolume30?: string;
    };
    signal?: string;
  };
  wyckoff?: {
    phase?: string;
    confidence?: number;
    notes?: string[];
  };
  wyckoffIndicators?: {
    asOf?: string;
    close?: string;
    ma50?: string;
    ma200?: string;
    rsi14?: string;
    avgVolume30?: string;
    latestVolume?: string;
    return30dPct?: string;
  };
};

type TechnicalViewData = {
  series: TechnicalSeriesPoint[];
  summary: TechnicalSummaryResponse;
  seriesMeta: TechnicalSeriesResponse["meta"] | null;
};

const SERIES_RANGE = "2y";
const SERIES_INTERVAL = "1mo";
const EMPTY_SERIES: TechnicalSeriesPoint[] = [];

function formatNumber(value: string | number | null | undefined) {
  const parsed =
    typeof value === "number"
      ? value
      : Number.parseFloat(String(value ?? "").replace(/[^0-9.-]/g, ""));

  if (Number.isNaN(parsed)) return "-";

  return new Intl.NumberFormat("id-ID").format(parsed);
}

function formatPercent(value: string | number | null | undefined) {
  const parsed =
    typeof value === "number"
      ? value
      : Number.parseFloat(String(value ?? "").replace(/[^0-9.-]/g, ""));

  if (Number.isNaN(parsed)) return "-";

  return `${new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(parsed)}%`;
}

function formatCurrency(value: string | number | null | undefined) {
  const formatted = formatNumber(value);
  return formatted === "-" ? formatted : `Rp ${formatted}`;
}

function formatDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    month: "short",
    year: "2-digit",
  }).format(date);
}

function getApiErrorMessage(fallback: string, status?: number) {
  return status ? `${fallback} (${status})` : fallback;
}

export function TechnicalSection({ asset }: { asset: ResearchAsset }) {
  const accent = COLOR_MAP[asset.color] ?? "#5FB88A";
  const [data, setData] = useState<TechnicalViewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const series = data?.series ?? EMPTY_SERIES;

  const rsiValue = Number.parseFloat(
    data?.summary.wyckoffIndicators?.rsi14 ??
    data?.summary.overview?.indicators?.rsi14 ??
    series[series.length - 1]?.rsi14 ??
    "",
  );
  const rsiTone =
    Number.isNaN(rsiValue) || (rsiValue >= 35 && rsiValue <= 70)
      ? "var(--amber)"
      : rsiValue > 70
        ? "var(--red)"
        : "var(--green)";

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTechnicalData() {
      setLoading(true);
      setError(null);

      try {
        const symbol = encodeURIComponent(asset.ticker.toLowerCase());
        const [seriesResponse, summaryResponse] = await Promise.all([
          fetch(
            `${API_BASE_URL}/stocks/${symbol}/technical-series?range=${SERIES_RANGE}&interval=${SERIES_INTERVAL}`,
            { signal: controller.signal },
          ),
          fetch(
            `${API_BASE_URL}/stocks/${symbol}/technical-summary?range=${SERIES_RANGE}&interval=${SERIES_INTERVAL}`,
            { signal: controller.signal },
          ),
        ]);

        if (!seriesResponse.ok) {
          throw new Error(
            getApiErrorMessage(
              "Gagal memuat technical series",
              seriesResponse.status,
            ),
          );
        }

        if (!summaryResponse.ok) {
          throw new Error(
            getApiErrorMessage(
              "Gagal memuat technical summary",
              summaryResponse.status,
            ),
          );
        }

        const seriesData = (await seriesResponse.json()) as TechnicalSeriesResponse;
        const summaryData = (await summaryResponse.json()) as TechnicalSummaryResponse;

        setData({
          series: seriesData.series ?? [],
          summary: summaryData,
          seriesMeta: seriesData.meta ?? null,
        });
      } catch (fetchError) {
        if (controller.signal.aborted) return;

        setData(null);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Gagal memuat analisis teknikal",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadTechnicalData();

    return () => {
      controller.abort();
    };
  }, [asset.ticker]);

  const chartLabels = useMemo(
    () => series.map((item) => formatDateLabel(item.date)),
    [series],
  );

  const chartValues = useMemo(
    () => series.map((item) => Number.parseFloat(item.close)),
    [series],
  );

  const latestPoint = series[series.length - 1];
  const summary = data?.summary;
  const snapshot = summary?.overview?.snapshot;
  const indicators = summary?.overview?.indicators;
  const wyckoff = summary?.wyckoff;
  const wyckoffIndicators = summary?.wyckoffIndicators;

  useEffect(() => {
    if (!canvasRef.current || !series.length) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels: chartLabels,
        datasets: [
          {
            label: `${asset.ticker} Close`,
            data: chartValues,
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
              label: (ctx) => ` ${formatCurrency(ctx.parsed.y)}`,
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
  }, [accent, asset.ticker, chartLabels, chartValues, series.length]);

  if (loading) {
    return (
      <div className="placeholder" >
        <h3>Memuat analisis teknikal </h3>
        <p>
          Data chart dan Wyckoff untuk {asset.ticker} sedang diambil dari API.
        </p>
      </div>
    );
  }

  if (error || !data?.series.length || !summary) {
    return (
      <div className="placeholder" >
        <h3>Data teknikal belum tersedia </h3>
        < p > {error || `Analisis teknikal untuk ${asset.ticker} sedang disiapkan.`
        } </p>
      </div>
    );
  }

  const periodRange = summary.meta?.period?.range ?? SERIES_RANGE;
  const periodInterval = summary.meta?.period?.interval ?? SERIES_INTERVAL;
  const periodTo = summary.meta?.period?.to
    ? new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(summary.meta.period.to))
    : null;
  const companyName =
    summary.company?.displayName?.trim() ||
    summary.company?.legalName?.trim() ||
    asset.name;
  const chartDateLabel =
    summary.wyckoffIndicators?.asOf ?? snapshot?.date ?? latestPoint?.date;
  const latestClose = snapshot?.close ?? latestPoint?.close;
  const latestVolume =
    wyckoffIndicators?.latestVolume ?? snapshot?.volume ?? latestPoint?.volume;
  const avgVolume =
    wyckoffIndicators?.avgVolume30 ?? indicators?.avgVolume30 ?? null;
  const signal = summary.overview?.signal ?? "-";
  const phase = wyckoff?.phase ?? "-";
  const confidence =
    typeof wyckoff?.confidence === "number"
      ? `${Math.round(wyckoff.confidence * 100)}%`
      : "-";
  const notes = wyckoff?.notes ?? [];

  return (
    <section className="tek-wrap" >
      <div className="tek-wyckoff" >
        <div className="tek-wyckoff-title" >
          Analisis Wyckoff — {companyName}
        </div>
        < div className="tek-wyckoff-sub" >
          Range {periodRange} · interval {periodInterval}
          {periodTo ? ` · updated ${periodTo}` : ""}
        </div>

        < div className="tek-indicators" >
          <div className="tek-ind" >
            <div className="tek-ind-lbl" > Snapshot </div>
            < div className="tek-ind-val" style={{ fontSize: "12px" }}>
              {formatCurrency(latestClose)}
            </div>
            < div className="tek-ind-sig" style={{ color: "var(--muted2)" }}>
              {chartDateLabel ? formatDateLabel(chartDateLabel) : "-"}
            </div>
          </div>
          < div className="tek-ind" >
            <div className="tek-ind-lbl" > Signal </div>
            < div className="tek-ind-val" style={{ fontSize: "12px" }}>
              {signal}
            </div>
            < div className="tek-ind-sig" style={{ color: "var(--muted2)" }}>
              Wyckoff summary
            </div>
          </div>
          < div className="tek-ind" >
            <div className="tek-ind-lbl" > Phase </div>
            < div className="tek-ind-val" style={{ fontSize: "12px" }}>
              {phase}
            </div>
            < div className="tek-ind-sig" style={{ color: "var(--muted2)" }}>
              Confidence {confidence}
            </div>
          </div>
          < div className="tek-ind" >
            <div className="tek-ind-lbl" > Volume </div>
            < div className="tek-ind-val" style={{ fontSize: "12px" }}>
              {formatCurrency(latestVolume)}
            </div>
            < div className="tek-ind-sig" style={{ color: "var(--grove)" }}>
              Avg 30 hari {avgVolume ? `· ${formatCurrency(avgVolume)}` : ""}
            </div>
          </div>
        </div>

        < div className="tek-indicators" >
          <div className="tek-ind" >
            <div className="tek-ind-lbl" > RSI(14) </div>
            < div className="tek-ind-val" style={{ color: rsiTone }}>
              {
                formatNumber(
                  wyckoffIndicators?.rsi14 ?? indicators?.rsi14 ?? latestPoint?.rsi14,
                )}
            </div>
            < div className="tek-ind-sig" style={{ color: rsiTone }}>
              {
                Number.isNaN(rsiValue)
                  ? "-"
                  : rsiValue > 70
                    ? "Overbought"
                    : rsiValue < 35
                      ? "Oversold"
                      : "Netral"
              }
            </div>
          </div>
          < div className="tek-ind" >
            <div className="tek-ind-lbl" > MA 50 harian </div>
            <div className="tek-ind-val" style={{ fontSize: "12px" }}>
              {
                formatCurrency(
                  wyckoffIndicators?.ma50 ?? indicators?.ma50 ?? latestPoint?.ma50,
                )}
            </div>
            <div className="tek-ind-sig" style={{ color: "var(--muted2)" }}>
              Moving Average
            </div>
          </div>
          <div className="tek-ind" >
            <div className="tek-ind-lbl" > MA 200 harian </div>
            <div className="tek-ind-val" style={{ fontSize: "12px" }}>
              {
                formatCurrency(
                  wyckoffIndicators?.ma200 ?? indicators?.ma200 ?? latestPoint?.ma200,
                )}
            </div>
            < div className="tek-ind-sig" style={{ color: "var(--muted2)" }}>
              Long Term Avg
            </div>
          </div>
          < div className="tek-ind" >
            <div className="tek-ind-lbl" > Volume / Hari </div>
            < div className="tek-ind-val" style={{ fontSize: "12px" }}>
              {formatCurrency(avgVolume ?? latestVolume)}
            </div>
            <div className="tek-ind-sig" style={{ color: "var(--grove)" }}>
              Avg 30 hari
            </div>
          </div>
        </div>

        < div className="tek-chart-wrap" >
          <div className="tek-chart-ttl" >
            Chart harga close {asset.ticker} · {SERIES_RANGE} / {SERIES_INTERVAL}
          </div>
          <div style={{ position: "relative", height: "200px", width: "100%" }}>
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={`Technical series chart for ${asset.ticker}`}
            />
          </div>
        </div>

        <div className="tek-analysis-rows" >
          {
            notes.length ? (
              notes.map((item) => (
                <div key={item} className="tek-row" >
                  <div
                    className="tek-row-ico"
                    style={{ background: "var(--grove)" }}
                  />
                  <div
                    className="tek-row-txt"
                    dangerouslySetInnerHTML={{ __html: item }}
                  />
                </div>
              ))
            ) : (
              <div className="tek-row" >
                <div
                  className="tek-row-ico"
                  style={{ background: "var(--grove)" }}
                />
                < div className="tek-row-txt" >
                  Wyckoff summary untuk {asset.ticker} belum memiliki catatan detail.
                </div>
              </div>
            )}
        </div>
      </div>

      < div className="disc" >
        Analisis teknikal ini ditarik langsung dari endpoint technical - series dan
        technical - summary.Bukan merupakan sinyal trading; gunakan bersama
        konteks fundamental dan risk management yang memadai.
      </div>
    </section>
  );
}
