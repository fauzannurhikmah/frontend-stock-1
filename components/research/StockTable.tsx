"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ResearchAsset,
  ResearchAssetClass,
  ResearchHorizon,
} from "@/lib/types";
import {
  COLOR_MAP,
  getGrovePillars,
  grovePillarColor,
  probColor,
  scoreColor,
  stanceLabel,
} from "@/lib/research-utils";

function GrovePillarCell({ score, label }: { score: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        className="font-serif text-[17px] font-medium leading-none tracking-[-0.02em]"
        style={{ color: grovePillarColor(score) }}
      >
        {score}
      </div>
      <div className="text-[8px] font-semibold uppercase tracking-[.12em] text-grove-muted">
        {label}
      </div>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className="text-[13px] font-medium"
        style={{ color: scoreColor(score) }}
      >
        {score}
      </span>
      <div className="mt-1 h-[3px] w-[42px] rounded-[2px] bg-[rgba(255,255,255,0.05)]">
        <div
          className="h-full rounded-[2px]"
          style={{ width: `${score}%`, background: scoreColor(score) }}
        />
      </div>
    </div>
  );
}

function ProbCell({ value, negative }: { value: number; negative?: boolean }) {
  const color = negative ? "var(--red)" : probColor(value);
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[14px] font-medium" style={{ color }}>
        {value}%
      </span>
      <div className="h-[3px] w-[42px] rounded-[2px] bg-[rgba(255,255,255,0.05)]">
        <div
          className="h-full rounded-[2px]"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

function stanceBadgeClass(stance: "ow" | "nt" | "uw") {
  if (stance === "ow") {
    return "border-[rgba(34,201,122,0.25)] bg-[rgba(34,201,122,0.12)] text-[#22C97A]";
  }
  if (stance === "nt") {
    return "border-[rgba(240,160,48,0.25)] bg-[rgba(240,160,48,0.12)] text-grove-amber";
  }
  return "border-[rgba(224,72,72,0.25)] bg-[rgba(224,72,72,0.12)] text-grove-red";
}

function priceDisplay(asset: ResearchAsset, assetClass: ResearchAssetClass) {
  if (assetClass === "bonds") {
    return (
      <>
        <div className="text-[12px] font-medium">{asset.price}</div>
        <div className="text-[10px] font-mono text-[#22C97A]">{asset.fv}</div>
      </>
    );
  }

  if (assetClass === "mmf" && asset.sector.includes("MMF")) {
    return (
      <>
        <div className="text-[12px] font-medium">{asset.price}</div>
        <div className="text-[10px] font-mono text-[#22C97A]">
          {asset.change}
        </div>
      </>
    );
  }

  const price = asset.price.startsWith("USD")
    ? asset.price
    : `Rp ${asset.price}`;
  const changeClass = asset.change.startsWith("+")
    ? "text-[#22C97A]"
    : "text-grove-red";
  return (
    <>
      <div className="text-[12px] font-medium">{price}</div>
      <div className={`text-[10px] font-mono ${changeClass}`}>
        {asset.change}
      </div>
    </>
  );
}

export function StockTable({
  rows,
  assetClass,
  horizon,
}: {
  rows: ResearchAsset[];
  assetClass: ResearchAssetClass;
  horizon: ResearchHorizon;
}) {
  const router = useRouter();
  const isStockClass =
    assetClass === "stocks" || assetClass === "us" || assetClass === "global";
  const priceLabel =
    assetClass === "bonds"
      ? "Harga/Yield"
      : assetClass === "mmf"
        ? "NAB/Harga"
        : "Harga";

  if (rows.length === 0) {
    return (
      <div className="rounded-[10px] border border-grove-border bg-grove-bg2 px-4 py-8 text-center text-[12px] text-grove-muted">
        Belum ada emiten di sektor ini
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[10px] border border-grove-border bg-grove-bg2">
      <table className="w-full min-w-[900px] border-collapse text-[11px]">
        <thead className="bg-grove-bg3">
          <tr className="border-b border-grove-border text-[9px] font-medium uppercase tracking-[.08em] text-grove-muted">
            <th className="w-10 px-4 py-2 text-left">#</th>
            <th className="px-4 py-2 text-left">
              {assetClass === "stocks"
                ? "Saham"
                : isStockClass
                  ? "Nama"
                  : "Instrumen"}
            </th>
            <th className="px-4 py-2 text-right">{priceLabel}</th>
            {isStockClass ? (
              ["G", "R", "O", "V", "E"].map((label) => (
                <th key={label} className="w-14 px-2 py-2 text-center">
                  {label}
                </th>
              ))
            ) : (
              <>
                <th className="px-4 py-2 text-center">Prob Positif</th>
                <th className="px-4 py-2 text-center">Prob Negatif</th>
                <th className="px-4 py-2 text-center">Expected Return</th>
              </>
            )}
            <th className="px-4 py-2 text-center">Score</th>
            <th className="px-4 py-2 text-center">Stance</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const score = row[horizon].score;
            const stance = row[horizon].stance;
            const tickerBadge = row.ticker.slice(0, 3).replace(".", "");
            const badgeColor = COLOR_MAP[row.color] || "#5FB88A";

            return (
              <tr
                key={`${row.ticker}-${horizon}`}
                className={`border-b border-grove-border transition-colors hover:bg-grove-bg3 cursor-pointer`}
                onClick={() => {
                  router.push(
                    `/report/${encodeURIComponent(row.ticker.toLowerCase())}`,
                  );
                }}
              >
                <td className="px-4 py-2 text-[11px] text-grove-muted">
                  {idx + 1}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] text-[9px] font-semibold"
                      style={{
                        backgroundColor: `${badgeColor}22`,
                        color: badgeColor,
                      }}
                    >
                      {tickerBadge}
                    </div>
                    <div>
                      <Link
                        href={`/report/${encodeURIComponent(row.ticker.toLowerCase())}`}
                        className="block text-[12.5px] font-medium text-grove-text hover:text-grove-primary"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {row.ticker}
                      </Link>
                      <div className="text-[10px] text-grove-muted">
                        {row.name} · {row.sector}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2 text-right">
                  {priceDisplay(row, assetClass)}
                </td>
                {isStockClass ? (
                  (() => {
                    const pillars = getGrovePillars(row, horizon);
                    return (
                      <>
                        <td className="px-2 py-2 text-center">
                          <GrovePillarCell score={pillars.g} label="G" />
                        </td>
                        <td className="px-2 py-2 text-center">
                          <GrovePillarCell score={pillars.r} label="R" />
                        </td>
                        <td className="px-2 py-2 text-center">
                          <GrovePillarCell score={pillars.o} label="O" />
                        </td>
                        <td className="px-2 py-2 text-center">
                          <GrovePillarCell score={pillars.v} label="V" />
                        </td>
                        <td className="px-2 py-2 text-center">
                          <GrovePillarCell score={pillars.e} label="E" />
                        </td>
                      </>
                    );
                  })()
                ) : (
                  <>
                    <td className="px-4 py-2 text-center">
                      <ProbCell value={row[horizon].prob} />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <ProbCell value={row[horizon].neg} negative />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className="text-[12px] font-medium font-mono"
                        style={{
                          color: row[horizon].ev.startsWith("+")
                            ? "var(--green)"
                            : "var(--red)",
                        }}
                      >
                        {row[horizon].ev}
                      </span>
                    </td>
                  </>
                )}
                <td className="px-4 py-2 text-center">
                  <ScoreBar score={score} />
                </td>
                <td className="px-4 py-2 text-center">
                  <span
                    className={`inline-block rounded-full border px-3 py-1 text-[9px] font-semibold ${stanceBadgeClass(stance)}`}
                  >
                    {stanceLabel(stance)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
