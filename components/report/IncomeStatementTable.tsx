"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { API_BASE_URL } from "@/lib/env";
import { ResearchAsset } from "@/lib/types";

type FinancialStatementPeriod = {
  key: string;
  label: string;
  period: string;
  fiscalYear: number;
  fiscalQuarter: number;
  periodEndDate: string;
};

type FinancialStatementValue = {
  raw: string;
  billion: string;
};

type FinancialStatementRow = {
  key: string;
  label: string;
  values: FinancialStatementValue[];
};

type FinancialStatementResponse = {
  listing?: {
    id?: string;
    symbol?: string;
  };
  company?: {
    id?: string;
    legalName?: string;
    displayName?: string;
  };
  sector?: {
    name?: string;
  };
  industry?: {
    name?: string;
  };
  report?: {
    unit?: string;
    periods?: FinancialStatementPeriod[];
    chart?: {
      revenue?: FinancialStatementValue[];
      netIncome?: FinancialStatementValue[];
    };
    table?: {
      rows?: FinancialStatementRow[];
    };
  };
};

type ReportRowView = {
  l: string;
  v: string[];
  bold?: boolean;
  hl?: boolean;
  neg?: boolean;
  sub?: boolean;
};

type ReportDataView = {
  unit: string;
  cols: string[];
  rows: ReportRowView[];
  chartRevenue: number[];
  chartNetIncome: number[];
  companyName: string;
};

function parseNumber(value: string) {
  const num = Number.parseFloat(value.replace(/[^0-9.\-]/g, ""));
  return Number.isNaN(num) ? 0 : num;
}

function formatBillion(value: FinancialStatementValue | undefined) {
  if (!value) return "-";
  return `${value.billion} B`;
}

function mapFinancialStatementResponse(
  response: FinancialStatementResponse,
): ReportDataView | null {
  const periods = response.report?.periods ?? [];
  const tableRows = response.report?.table?.rows ?? [];
  const chartRevenue = response.report?.chart?.revenue ?? [];
  const chartNetIncome = response.report?.chart?.netIncome ?? [];

  if (!periods.length || !tableRows.length) return null;

  const cols = periods.map((period) => period.label);
  const rows: ReportRowView[] = tableRows.map((row) => {
    const isNegative =
      row.key === "cogs" ||
      row.key === "operatingExpenses" ||
      row.key === "incomeTaxExpense";

    return {
      l: row.label,
      v: row.values.map(formatBillion),
      bold:
        row.key === "revenue" ||
        row.key === "grossProfit" ||
        row.key === "netIncome",
      hl: row.key === "grossProfit" || row.key === "netIncome",
      neg: isNegative,
      sub: isNegative,
    };
  });

  return {
    unit: response.report?.unit ?? "BILLION_IDR",
    cols,
    rows,
    chartRevenue: chartRevenue.map((item) => parseNumber(item.billion)),
    chartNetIncome: chartNetIncome.map((item) => parseNumber(item.billion)),
    companyName:
      response.company?.displayName?.trim() ||
      response.company?.legalName?.trim() ||
      response.listing?.symbol?.trim() ||
      "-",
  };
}

export function IncomeStatementTable({ asset }: { asset: ResearchAsset }) {
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [report, setReport] = useState<ReportDataView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const showFcLegend = false;

  const chartTitle =
    asset.assetClass === "bonds"
      ? "Harga & Yield — Trend Kuartalan"
      : asset.assetClass === "mmf"
        ? "NAB & Yield — Trend Kuartalan"
        : "Revenue & Laba Bersih — Trend Kuartalan";

  useEffect(() => {
    const controller = new AbortController();

    async function loadReport() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/stocks/${encodeURIComponent(asset.ticker)}/financial-statements`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error(`Failed to load financial statements (${response.status})`);
        }

        const data = (await response.json()) as FinancialStatementResponse;
        setReport(mapFinancialStatementResponse(data));
      } catch (fetchError) {
        if (controller.signal.aborted) return;
        setReport(null);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Gagal memuat laporan keuangan",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadReport();

    return () => {
      controller.abort();
    };
  }, [asset.ticker]);

  const chartRows = useMemo(() => {
    if (!report) return { rev: undefined, lb: undefined };
    return {
      rev: {
        l: "Total Pendapatan",
        v: report.chartRevenue.map((value) => String(value)),
      },
      lb: {
        l: "Laba Bersih Tahun Berjalan",
        v: report.chartNetIncome.map((value) => String(value)),
      },
    };
  }, [report]);

  useEffect(() => {
    if (!canvasRef.current || !report || !chartRows.rev || !chartRows.lb) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const labelsRev = report.cols;
    const revDataRev = chartRows.rev.v.map(parseNumber);
    const lbDataRev = chartRows.lb.v.map(parseNumber);
    const revColors = labelsRev.map(() => "rgba(58,158,232,0.22)");
    const lbColors = labelsRev.map(() => "rgba(95,184,138,0.25)");

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
  }, [chartRows, report]);

  if (loading) {
    return (
      <div className= "placeholder" >
      <h3>Memuat data laporan keuangan </h3>
        <p>
          Laporan keuangan detail untuk { asset.ticker } sedang diambil dari API.
        </p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className= "placeholder" >
      <h3>Data segera tersedia </h3>
        <p>
    { error || `Laporan keuangan detail untuk ${asset.ticker} sedang disiapkan.` }
    </p>
      </div>
    );
  }

  const firstColLabel =
    report.unit === "BILLION_IDR" ? "Dalam Miliar IDR" : "Nilai";

  return (
    <section className= "analysis-wrap" >
    <div className="is-chart-box" >
      <div className="is-chart-ttl" > { chartTitle } </div>
        < div className = "is-chart-legend" >
          <div className="is-leg-item" >
            <div className="is-leg-dot" style = {{ background: "#3A9EE8" }
} />
{
  asset.assetClass === "bonds"
  ? "Harga"
  : asset.assetClass === "mmf"
    ? "NAB"
    : "Total Pendapatan"
}
</div>
  < div className = "is-leg-item" >
    <div className="is-leg-dot" style = {{ background: "#5FB88A" }} />
{
  asset.assetClass === "bonds" || asset.assetClass === "mmf"
  ? "Yield (%)"
  : "Laba Bersih"
}
</div>
{
  showFcLegend ? (
    <div className= "is-leg-item" style = {{ marginLeft: "auto" }
}>
  <div
                className="is-leg-dot"
style = {{
  background: "#5FB88A",
    opacity: 0.5,
      border: "1.5px solid #5FB88A",
                }}
              />
              Proyeksi FY 2026E *
  </div>
          ) : null}
</div>
  < div className = "chart-h" >
    <canvas ref={ canvasRef } />
      </div>
      </div>

      < div className = "is-tbl-wrap" >
        <table className="is-tbl" >
          <thead>
          <tr>
          <th>{ firstColLabel } </th>
{
  report.cols.map((col) => (
    <th key= { col } > { col } </th>
  ))
}
</tr>
  </thead>
  <tbody>
{
  report.rows.map((row) => (
    <tr
                key= { row.l }
                className = {`${row.bold ? "is-bold" : ""} ${row.hl ? "is-hl" : ""} ${row.neg ? "is-neg" : ""} ${row.sub ? "is-sub" : ""}`}
              >
  <td>{ row.l } </td>
{
  row.v.map((value, index) => (
    <td key= {`${row.l}-${index}`}> { value } </td>
                ))}
</tr>
            ))}
</tbody>
  </table>
  </div>

{
  showFcLegend ? (
    <div className= "fc-legend" >
    <span className="fc-legend-mark" >* </span> Kolom dan baris bertanda
          asterisk merupakan proyeksi FY 2026E oleh tim riset Grove.Angka
          tersebut bersifat estimasi, bukan data historis, dan dapat direvisi
          seiring berjalannya periode.
        </div>
      ) : null
}
</section>
  );
}
