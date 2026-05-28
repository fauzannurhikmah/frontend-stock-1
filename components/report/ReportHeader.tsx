import { COLOR_MAP } from "@/lib/research-utils";
import { ResearchAsset } from "@/lib/types";

const assetClassBadge: Record<ResearchAsset["assetClass"], string> = {
  stocks: "Saham Indonesia",
  us: "Saham Amerika",
  global: "Saham Global",
  bonds: "Obligasi",
  mmf: "Reksadana/ETF",
};

type ReportHeaderProps = {
  asset: ResearchAsset;
  assetClassLabel?: string;
};

export function ReportHeader({ asset, assetClassLabel }: ReportHeaderProps) {
  const accent = COLOR_MAP[asset.color] ?? "#5FB88A";
  const isUSD = asset.price.startsWith("USD") || asset.fv.startsWith("USD");
  const showRawValue =
    asset.assetClass === "bonds" ||
    asset.assetClass === "mmf" ||
    isUSD ||
    asset.fv.includes("%");
  const priceLabel =
    asset.assetClass === "bonds" || asset.assetClass === "mmf" || isUSD
      ? asset.price
      : `Rp ${asset.price}`;
  const fvLabel = showRawValue ? asset.fv : `Fair Value: Rp ${asset.fv}`;
  return (
    <header className="mb-5 grid gap-4 border-b border-grove-border pb-5 md:grid-cols-[1fr_auto]">
      <div>
        <h1
          className="font-serif text-[38px] leading-none uppercase"
          style={{ color: accent }}
        >
          {asset.ticker}
        </h1>
        <p className="mt-1 text-[12px] text-grove-muted2">{asset.name}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="rounded-[8px] border border-grove-border2 px-2 py-1 text-[9px] text-grove-muted2">
            {asset.sector}
          </span>
          <span
            className="rounded-[8px] border px-2 py-1 text-[9px]"
            style={{ borderColor: `${accent}44`, color: accent }}
          >
            {assetClassLabel ?? assetClassBadge[asset.assetClass]}
          </span>
          <span
            className="rounded-[8px] border px-2 py-1 text-[9px]"
            style={{ borderColor: `${accent}44`, color: accent }}
          >
            Data Lengkap
          </span>
        </div>
      </div>
      <div className="md:text-right">
        <p className="font-serif text-[28px]">{priceLabel}</p>
        <p
          className={`font-mono text-[11px] ${
            asset.change.startsWith("+") ? "text-grove-green" : "text-grove-red"
          }`}
        >
          {asset.change}
        </p>
        <p className="text-[10px] text-grove-muted">{fvLabel}</p>
      </div>
    </header>
  );
}
