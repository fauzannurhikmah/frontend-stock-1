"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { API_BASE_URL } from "@/lib/env";
import { ResearchAsset } from "@/lib/types";
import { getReportFinancials, KsRow } from "@/data/reportFinancials";

type MetricId = "netIncome" | "eps" | "revenue";

type KeyStatisticsSummaryResponse = {
  listing?: {
    id?: string;
    symbol?: string;
  };
  company?: {
    id?: string;
    legalName?: string;
    displayName?: string;
  };
  valuationSummary?: {
    marketCap?: string | null;
    enterpriseValue?: string | null;
    sharesOutstanding?: string | null;
    freeFloatPct?: string | null;
    peTtm?: string | null;
  };
  dividendAndYield?: {
    divTtm?: string | null;
    payoutRatio?: string | null;
    divYield?: string | null;
  };
};

type KeyStatisticsMetricResponse = {
  listing?: {
    id?: string;
    symbol?: string;
  };
  company?: {
    id?: string;
    legalName?: string;
    displayName?: string;
  };
  metric?: MetricId;
  quarterlyAndProjection?: {
    chart?: Array<{
      label?: string;
      value?: string;
      type?: "actual" | "projection";
    }>;
    table?: Array<{
      period?: string;
      value?: string;
      growthYoY?: string | null;
    }>;
    ttm?: {
      value?: string;
      avgGrowthYoY?: string | null;
      ttmGrowthYoY?: string | null;
    };
  };
};

type MetricChartPoint = {
  label: string;
  value: number;
  isForecast: boolean;
};

type MetricTableRow = {
  period: string;
  value: string;
  growthYoY: string;
  isForecast: boolean;
};

type MetricViewData = {
  chart: MetricChartPoint[];
  table: MetricTableRow[];
  ttm?: KeyStatisticsMetricResponse["quarterlyAndProjection"]["ttm"];
};

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

const USE_API_ASSET_CLASSES = new Set<ResearchAsset["assetClass"]>([
  "stocks",
  "us",
  "global",
]);

const metricEndpoints = {
  netIncome: "netIncome",
  eps: "eps",
  revenue: "revenue",
} as const;

function isForecast(row: KsRow) {
  return row.fc || (row.p && /^FY \d+E$/.test(row.p));
}

function parseNumber(value: string | undefined) {
  if (!value) return 0;
  const num = Number.parseFloat(value.replace(/[^0-9.\-]/g, ""));
  return Number.isNaN(num) ? 0 : num;
}

function parseApiNumber(value: string | null | undefined) {
  if (!value) return 0;
  const num = Number.parseFloat(String(value).replace(/[^0-9.\-]/g, ""));
  return Number.isNaN(num) ? 0 : num;
}

function formatDecimal(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits,
  }).format(value);
}

function formatChartMagnitude(value: number) {
  const absValue = Math.abs(value);
  if (absValue >= 1e12) return `${formatDecimal(value / 1e12)} T`;
  if (absValue >= 1e9) return `${formatDecimal(value / 1e9)} B`;
  if (absValue >= 1e6) return `${formatDecimal(value / 1e6)} Jt`;
  if (absValue >= 1e3) return formatDecimal(value / 1e3, 1);
  return formatDecimal(value, 2);
}

function formatCurrencyMagnitude(value: string | null | undefined) {
  const num = parseApiNumber(value);
  if (!num) return value ? `Rp ${formatDecimal(num)}` : "-";

  const absValue = Math.abs(num);
  if (absValue >= 1e12) return `Rp ${formatDecimal(num / 1e12)} T`;
  if (absValue >= 1e9) return `Rp ${formatDecimal(num / 1e9)} B`;
  if (absValue >= 1e6) return `Rp ${formatDecimal(num / 1e6)} Jt`;
  return `Rp ${formatDecimal(num)}`;
}

function formatCountMagnitude(value: string | null | undefined) {
  const num = parseApiNumber(value);
  if (!num) return value ? formatDecimal(num) : "-";

  const absValue = Math.abs(num);
  if (absValue >= 1e12) return `${formatDecimal(num / 1e12)} T`;
  if (absValue >= 1e9) return `${formatDecimal(num / 1e9)} B`;
  if (absValue >= 1e6) return `${formatDecimal(num / 1e6)} Jt`;
  return formatDecimal(num);
}

function formatPlainNumber(value: string | null | undefined) {
  const num = parseApiNumber(value);
  if (!num) return value ? formatDecimal(num) : "-";
  return formatDecimal(num);
}

function formatPercent(value: string | null | undefined) {
  const num = parseApiNumber(value);
  if (!num && value !== "0" && value !== "0.0") return "-";
  return `${formatDecimal(num, 2)}%`;
}

function formatMetricValue(metric: MetricId, value: string | null | undefined) {
  if (metric === "eps") {
    return formatPlainNumber(value);
  }

  return formatCurrencyMagnitude(value);
}

function formatMetricTooltip(metric: MetricId, value: number) {
  if (metric === "eps") {
    return formatDecimal(value);
  }

  return formatChartMagnitude(value);
}

function formatChartAxisValue(metric: MetricId, value: number) {
  if (metric === "eps") {
    return formatDecimal(value, 1);
  }

  return formatChartMagnitude(value);
}

export function KeyStatsSection({ asset }: { asset: ResearchAsset }) {
  const [activeMetric, setActiveMetric] = useState<MetricId>("netIncome");
  const [summaryData, setSummaryData] =
    useState<KeyStatisticsSummaryResponse | null>(null);
  const [metricCache, setMetricCache] = useState<Partial<Record<MetricId, MetricViewData>>>(
    {},
  );
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [metricLoading, setMetricLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [metricError, setMetricError] = useState<string | null>(null);
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const useApi = USE_API_ASSET_CLASSES.has(asset.assetClass);
  const { ks } = getReportFinancials(asset.ticker);

  const labelSet = LABELS[asset.assetClass];
  const extraLabels = EXTRA_LABELS[asset.assetClass];
  const showPE =
    asset.assetClass === "stocks" ||
    asset.assetClass === "us" ||
    asset.assetClass === "global";

  useEffect(() => {
    setActiveMetric("netIncome");
    setSummaryData(null);
    setMetricCache({});
    setSummaryError(null);
    setMetricError(null);
  }, [asset.ticker]);

  useEffect(() => {
    if (!useApi) return;

    const controller = new AbortController();

    async function loadSummary() {
      setSummaryLoading(true);
      setSummaryError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/stocks/${encodeURIComponent(asset.ticker.toLowerCase())}/key-statistics-summary`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error(`Gagal memuat ringkasan valuasi (${response.status})`);
        }

        const data = (await response.json()) as KeyStatisticsSummaryResponse;
        setSummaryData(data);
      } catch (fetchError) {
        if (controller.signal.aborted) return;

        setSummaryData(null);
        setSummaryError(
          fetchError instanceof Error
            ? fetchError.message
            : "Gagal memuat ringkasan valuasi",
        );
      } finally {
        if (!controller.signal.aborted) {
          setSummaryLoading(false);
        }
      }
    }

    void loadSummary();

    return () => {
      controller.abort();
    };
  }, [asset.ticker, useApi]);

  useEffect(() => {
    if (!useApi) return;

    if (metricCache[activeMetric]) {
      return;
    }

    const controller = new AbortController();

    async function loadMetric() {
      setMetricLoading(true);
      setMetricError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/stocks/${encodeURIComponent(asset.ticker.toLowerCase())}/key-statistics?metric=${metricEndpoints[activeMetric]}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error(`Gagal memuat data ${activeMetric} (${response.status})`);
        }

        const data = (await response.json()) as KeyStatisticsMetricResponse;
        const points = data.quarterlyAndProjection?.chart ?? [];
        const table = data.quarterlyAndProjection?.table ?? [];

        const viewData: MetricViewData = {
          chart: points
            .filter((item): item is NonNullable<typeof item> => Boolean(item?.label))
            .map((item) => ({
              label: item.label ?? "",
              value: parseApiNumber(item.value),
              isForecast: item.type === "projection",
            })),
          table: table
            .filter((item): item is NonNullable<typeof item> => Boolean(item?.period))
            .map((item) => ({
              period: item.period ?? "",
              value: item.value ? formatMetricValue(activeMetric, item.value) : "-",
              growthYoY:
                item.growthYoY === null || item.growthYoY === undefined
                  ? "-"
                  : `${formatDecimal(parseApiNumber(item.growthYoY), 2)}%`,
              isForecast: /E$/.test(item.period ?? ""),
            })),
          ttm: data.quarterlyAndProjection?.ttm,
        };

        setMetricCache((current) => ({
          ...current,
          [activeMetric]: viewData,
        }));
      } catch (fetchError) {
        if (controller.signal.aborted) return;

        setMetricError(
          fetchError instanceof Error
            ? fetchError.message
            : `Gagal memuat data ${activeMetric}`,
        );
      } finally {
        if (!controller.signal.aborted) {
          setMetricLoading(false);
        }
      }
    }

    void loadMetric();

    return () => {
      controller.abort();
    };
  }, [activeMetric, asset.ticker, metricCache, useApi]);

  const activeRows = useMemo(() => {
    if (!ks) return [] as KsRow[];
    return ks[activeMetric] ?? ks.netIncome;
  }, [activeMetric, ks]);

  const apiMetricData = useMemo(
    () => metricCache[activeMetric] ?? null,
    [activeMetric, metricCache],
  );

  const chartModel = useMemo(() => {
    if (useApi) {
      const chart = apiMetricData?.chart ?? [];
      return {
        labels: chart.map((item) => item.label),
        values: chart.map((item) => item.value),
        forecast: chart.map((item) => item.isForecast),
      };
    }

    const chartRows = activeRows.filter(
      (row) =>
        row.p &&
        (row.p.startsWith("Q") ||
          row.p.startsWith("Apr") ||
          (row.p.startsWith("FY") &&
            !row.p.includes("2023") &&
            !row.p.includes("2024"))),
    );

    return {
      labels: chartRows.map((row) => row.p),
      values: chartRows.map((row) => parseNumber(row.v)),
      forecast: chartRows.map((row) => isForecast(row)),
    };
  }, [activeRows, apiMetricData, useApi]);

  useEffect(() => {
    if (!canvasRef.current || chartModel.labels.length === 0) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const colors = chartModel.forecast.map((row) =>
      row ? "rgba(95,184,138,0.55)" : "rgba(95,184,138,0.22)",
    );
    const borders = chartModel.forecast.map(() => "#5FB88A");
    const borderWidths = chartModel.forecast.map((row) => (row ? 2 : 1.5));

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: chartModel.labels,
        datasets: [
          {
            data: chartModel.values,
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
              label: (ctx) =>
                ` ${useApi ? formatMetricTooltip(activeMetric, ctx.parsed.y ?? 0) : (ctx.parsed.y ?? 0).toLocaleString()}`,
              afterLabel: (ctx) =>
                chartModel.forecast[ctx.dataIndex] ? "(Proyeksi Grove)" : "",
            },
          },
        },
        scales: {
          x: {
            ticks: { color: "#6B7F72", font: { size: 10, family: "Inter" } },
            grid: { display: false },
          },
          y: {
            ticks: {
              color: "#6B7F72",
              font: { size: 10, family: "Inter" },
              callback: (value) =>
                formatChartAxisValue(activeMetric, Number(value)),
            },
            grid: { color: "rgba(255,255,255,0.03)" },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [activeMetric, chartModel, useApi]);

  if (useApi) {
    const summary = summaryData;
    const valuation = summary?.valuationSummary;
    const dividend = summary?.dividendAndYield;
    const companyName =
      summary?.company?.displayName?.trim() ||
      summary?.company?.legalName?.trim() ||
      asset.name;

    const currentMetricData = apiMetricData;

    if (summaryLoading || (metricLoading && !currentMetricData)) {
      return (
        <div className= "placeholder" >
        <h3>Memuat key statistics </h3>
          <p>
            Ringkasan valuasi dan data kuartalan untuk { asset.ticker } sedang
            diambil dari API.
          </p>
        </div>
      );
    }

    if (summaryError || metricError || !summary || !currentMetricData) {
      return (
        <div className= "placeholder" >
        <h3>Data key statistics belum tersedia </h3>
          <p>
      { summaryError || metricError || `Key statistics untuk ${asset.ticker} sedang disiapkan.` }
      </p>
        </div>
      );
    }

    const title = `${labelSet[activeMetric]} — ${companyName} · Trend Kuartalan & Proyeksi`;
    const valHdr = activeMetric === "eps" ? "Nilai" : "Nilai";
    const grHdr = "Growth YoY";
    const marketCap = formatCurrencyMagnitude(valuation?.marketCap);
    const enterpriseValue = formatCurrencyMagnitude(valuation?.enterpriseValue);
    const sharesOutstanding = formatCountMagnitude(valuation?.sharesOutstanding);
    const freeFloatPct = formatPercent(valuation?.freeFloatPct);
    const peTtm = valuation?.peTtm ? `${formatDecimal(parseApiNumber(valuation.peTtm), 2)}x` : "-";
    const divTtm = formatCurrencyMagnitude(dividend?.divTtm);
    const payoutRatio = formatPercent(dividend?.payoutRatio);
    const divYield = formatPercent(dividend?.divYield);
    const ttmValue = currentMetricData.ttm?.value
      ? formatMetricValue(activeMetric, currentMetricData.ttm.value)
      : "-";
    const ttmGrowth = currentMetricData.ttm?.ttmGrowthYoY
      ? `${formatDecimal(parseApiNumber(currentMetricData.ttm.ttmGrowthYoY), 2)}%`
      : "-";

    return (
      <section className= "analysis-wrap" >
      <div className="slbl" style = {{ marginTop: 0 }
  }>
    Ringkasan Valuasi
      </div>
      < div className = "ks-extra" >
        <div className="ks-ext-item" >
          <div className="ks-ext-lbl" > Market Cap </div>
            < div className = "ks-ext-val" > { marketCap } </div>
              </div>
              < div className = "ks-ext-item" >
                <div className="ks-ext-lbl" > Enterprise Value </div>
                  < div className = "ks-ext-val" > { enterpriseValue } </div>
                    </div>
                    < div className = "ks-ext-item" >
                      <div className="ks-ext-lbl" > Shares Outstanding </div>
                        < div className = "ks-ext-val" > { sharesOutstanding } </div>
                          </div>
                          < div className = "ks-ext-item" >
                            <div className="ks-ext-lbl" > Free Float </div>
                              < div className = "ks-ext-val" > { freeFloatPct } </div>
                                </div>
                                </div>

                                < div className = "ks-extra" style = {{ marginTop: "-4px" }
}>
  <div className="ks-ext-item" >
    <div className="ks-ext-lbl" > PE(TTM) </div>
      < div className = "ks-ext-val" > { peTtm } </div>
        </div>
        < div className = "ks-ext-item" >
          <div className="ks-ext-lbl" > Div TTM </div>
            < div className = "ks-ext-val" > { divTtm } </div>
              </div>
              < div className = "ks-ext-item" >
                <div className="ks-ext-lbl" > Payout Ratio </div>
                  < div className = "ks-ext-val" > { payoutRatio } </div>
                    </div>
                    < div className = "ks-ext-item" >
                      <div className="ks-ext-lbl" > Div Yield </div>
                        < div className = "ks-ext-val" > { divYield } </div>
                          </div>
                          </div>

                          < div className = "slbl" > Data Per Kuartal & amp; Proyeksi </div>
                            < div className = "ks-metric-tabs" >
                              {(Object.keys(labelSet) as MetricId[]).map((metricId) => (
                                <button
              key= { metricId }
              className = {`ks-mtab ${activeMetric === metricId ? "active" : ""}`}
                                onClick = {() => setActiveMetric(metricId)}
                                type = "button"
                                >
                                { labelSet[metricId]}
                                </button>
                              ))}
</div>

  < div className = "ks-chart-box" >
    <div className="ks-chart-ttl" > { title } </div>
      < div className = "chart-h" >
        <canvas ref={ canvasRef } />
          </div>
          </div>

          < div className = "ks-tbl-wrap" >
            <div className="ks-row hdr" >
              <span>Periode </span>
              < span style = {{ textAlign: "right" }}> { valHdr } </span>
                < span style = {{ textAlign: "right" }}> { grHdr } </span>
                  </div>
{
  currentMetricData.table.map((row) => (
    <div
              key= {`${row.period}-${row.value}`}
className = {`ks-row ${row.isForecast ? "fc-row" : ""}`}
            >
  <span className="ks-period" >
    {
      row.isForecast ? (
        <>
        { row.period } < span className="fc-asterisk" >* </span>
        </>
                ) : (
          row.period
        )}
</span>
  < span className = "ks-val" > { row.value } </span>
    < span className = {`ks-grow ${row.growthYoY !== "-" ? "pos" : ""}`}>
      { row.growthYoY }
      </span>
      </div>
          ))}
<div className="ks-divider" >
  <span>TTM Summary </span>
    </div>
    < div className = "ks-row bold" >
      <span className="ks-period" > TTM </span>
        < span className = "ks-val" > { ttmValue } </span>
          < span className = "ks-grow pos" > { ttmGrowth } </span>
            </div>
            </div>

            < div className = "fc-legend" >
              <span className="fc-legend-mark" >* </span> Data kuartalan dan proyeksi
          diambil langsung dari endpoint key - statistics.
        </div>
  </section>
    );
  }

if (!ks) {
  return (
    <div className= "placeholder" >
    <h3>Data segera tersedia </h3>
      <p>
          Grove sedang menyiapkan riset mendalam untuk { asset.ticker }.Sementara
  itu, bagian Analisis & amp; Penilaian sudah lengkap.
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
  <section className= "analysis-wrap" >
  <div className="slbl" style = {{ marginTop: 0 }}>
    Ringkasan
{
  asset.assetClass === "bonds"
    ? " Instrumen"
    : asset.assetClass === "mmf"
      ? " Produk"
      : " Valuasi"
}
</div>
  < div className = "ks-extra" >
    <div className="ks-ext-item" >
      <div className="ks-ext-lbl" > { extraLabels.mktCap } </div>
        < div className = "ks-ext-val" > { ks.extra.mktCap } </div>
          </div>
          < div className = "ks-ext-item" >
            <div className="ks-ext-lbl" > { extraLabels.ev } </div>
              < div className = "ks-ext-val" > { ks.extra.ev } </div>
                </div>
                < div className = "ks-ext-item" >
                  <div className="ks-ext-lbl" > { extraLabels.shares } </div>
                    < div className = "ks-ext-val" > { ks.extra.shares } </div>
                      </div>
                      < div className = "ks-ext-item" >
                        <div className="ks-ext-lbl" > { extraLabels.ff } </div>
                          < div className = "ks-ext-val" > { ks.extra.ff } </div>
                            </div>
                            </div>

{
  showPE && (ks.extra.peTTM || ks.extra.pe26) ? (
    <div className= "ks-extra" style = {{ marginTop: "-4px" }
}>
  <div className="ks-ext-item" >
    <div className="ks-ext-lbl" > PE(TTM) </div>
      < div className = "ks-ext-val" > { ks.extra.peTTM ?? "-" } </div>
        </div>
        < div className = "ks-ext-item" >
          <div className="ks-ext-lbl" >
            PE FY 2026E < span className = "fc-asterisk" >* </span>
              </div>
              < div className = "ks-ext-val" style = {{ color: "var(--grove)" }}>
                { ks.extra.pe26 ?? "-" }
                </div>
                </div>
                < div className = "ks-ext-item" >
                  <div className="ks-ext-lbl" > PE Avg 5Y(Ref) </div>
                    < div className = "ks-ext-val" > -</div>
                      </div>
                      < div className = "ks-ext-item" >
                        <div className="ks-ext-lbl" > Posisi vs Avg </div>
                          < div
className = "ks-ext-val"
style = {{ color: "var(--muted2)", fontSize: "13px" }}
            >
  Reference
  </div>
  </div>
  </div>
      ) : null}

<div className="slbl" > Data Per Kuartal & amp; Proyeksi </div>
  < div className = "ks-metric-tabs" >
    {(Object.keys(labelSet) as MetricId[]).map((metricId) => (
      <button
            key= { metricId }
            className = {`ks-mtab ${activeMetric === metricId ? "active" : ""}`}
      onClick = {() => setActiveMetric(metricId)}
      type = "button"
      >
      { labelSet[metricId]}
      </button>
    ))}
</div>
  < div className = "ks-chart-box" >
    <div className="ks-chart-ttl" > { title } </div>
      < div className = "chart-h" >
        <canvas ref={ canvasRef } />
          </div>
          </div>
          < div className = "ks-tbl-wrap" >
            <div className="ks-row hdr" >
              <span>Periode </span>
              < span style = {{ textAlign: "right" }}> { valHdr } </span>
                < span style = {{ textAlign: "right" }}> { grHdr } </span>
                  </div>
{
  activeRows.map((row) => {
    if (row.p === "divider") {
      return (
        <div key= {`div-${row.label}`
    } className = "ks-divider" >
      <span>{ row.label } </span>
      </div>
            );
}

const forecast = isForecast(row);
return (
  <div
              key= {`${row.p}-${row.v}`}
className = {`ks-row ${row.bold ? "bold" : ""} ${forecast ? "fc-row" : ""
  }`}
            >
  <span className="ks-period" >
  {
    forecast?(
                  <>
    { row.p } < span className = "fc-asterisk" >* </span>
      </>
                ) : (
  row.p
)}
</span>
  < span className = "ks-val" > { row.v ?? "-" } </span>
    < span
className = {`ks-grow ${row.g ? (row.pos ? "pos" : "neg") : ""}`}
              >
  { row.g ?? "-" }
  </span>
  </div>
          );
        })}
</div>
  < div className = "fc-legend" >
    <span className="fc-legend-mark" >* </span> Proyeksi FY 2026E adalah
        estimasi internal tim riset Grove berdasarkan tren kuartalan, konsensus
pasar, dan asumsi makro yang dapat berubah sewaktu - waktu.
      </div>
  </section>
  );
}
