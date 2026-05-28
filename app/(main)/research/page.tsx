"use client";

import { useEffect, useMemo, useState } from "react";
import { AssetTab, ResearchAssetClass, ResearchHorizon } from "@/lib/types";
import { researchAssets } from "@/data/researchData";
import { DashboardHeader } from "@/components/research/DashboardHeader";
import { AssetClassTabs } from "@/components/research/AssetClassTabs";
import { SummaryCards } from "@/components/research/SummaryCards";
import { SectorFilter } from "@/components/research/SectorFilter";
import { HorizonTabs } from "@/components/research/Horizontabs";
import { StockTable } from "@/components/research/StockTable";
import { getSectorOptions } from "@/lib/sectors-api";
import {
  GLOBAL_FILTER_OPTIONS,
  US_SECTOR_OPTIONS,
  getGlobalRegionGroup,
  getGlobalSectorGroup,
  getSectorGroup,
  getUSSectorGroup,
} from "@/lib/research-utils";

const assetClassMap: Record<AssetTab, ResearchAssetClass> = {
  indonesia: "stocks",
  us: "us",
  global: "global",
  bonds: "bonds",
  mmf: "mmf",
};

const horizonLabel: Record<ResearchHorizon, string> = {
  lt: "Long Term",
  mt: "Medium Term",
  st: "Short Term",
};

const DEFAULT_STOCK_OPTIONS = [{ key: "all", label: "Semua sektor" }];

function normalizeFilterKey(value: string) {
  return value.trim().toLowerCase();
}

function mergeStockSectorOptions(
  remoteOptions: Array<{ key: string; label: string }>,
) {
  const merged = [{ key: "all", label: "Semua sektor" }];

  const uniqueKeys = new Set<string>(["all"]);
  for (const opt of remoteOptions) {
    const normalizedKey = normalizeFilterKey(opt.label);
    if (!normalizedKey || uniqueKeys.has(normalizedKey)) continue;
    uniqueKeys.add(normalizedKey);
    merged.push({ key: normalizedKey, label: opt.label });
  }

  return merged;
}

export default function ResearchPage() {
  const [assetTab, setAssetTab] = useState<AssetTab>("indonesia");
  const [horizon, setHorizon] = useState<ResearchHorizon>("lt");
  const [stockSector, setStockSector] = useState("all");
  const [usSector, setUsSector] = useState("all");
  const [globalFilter, setGlobalFilter] = useState("all");
  const [stockSectorOptions, setStockSectorOptions] = useState(
    DEFAULT_STOCK_OPTIONS,
  );

  const assetClass = assetClassMap[assetTab];

  useEffect(() => {
    let isMounted = true;

    getSectorOptions()
      .then((remoteOptions) => {
        if (!isMounted) return;
        setStockSectorOptions(mergeStockSectorOptions(remoteOptions));
      })
      .catch(() => {
        if (!isMounted) return;
        setStockSectorOptions(DEFAULT_STOCK_OPTIONS);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredAssets = useMemo(() => {
    let assets = researchAssets.filter(
      (asset) => asset.assetClass === assetClass,
    );

    if (assetClass === "stocks" && stockSector !== "all") {
      assets = assets.filter(
        (asset) =>
          getSectorGroup(asset) === stockSector ||
          normalizeFilterKey(asset.sector) === stockSector,
      );
    }

    if (assetClass === "us" && usSector !== "all") {
      assets = assets.filter((asset) => getUSSectorGroup(asset) === usSector);
    }

    if (assetClass === "global" && globalFilter !== "all") {
      const regionKeys = new Set(["europe", "japan", "china", "asean"]);
      if (regionKeys.has(globalFilter)) {
        assets = assets.filter(
          (asset) => getGlobalRegionGroup(asset) === globalFilter,
        );
      } else {
        assets = assets.filter(
          (asset) => getGlobalSectorGroup(asset) === globalFilter,
        );
      }
    }

    return assets;
  }, [assetClass, globalFilter, stockSector, usSector]);

  const sortedRows = useMemo(
    () =>
      [...filteredAssets].sort((a, b) => b[horizon].score - a[horizon].score),
    [filteredAssets, horizon],
  );

  const tableLabel = useMemo(() => {
    if (assetClass === "stocks") {
      return `Ranking ${horizonLabel[horizon]} — GROVE Score (G·R·O·V·E breakdown)`;
    }
    if (assetClass === "us") {
      return `Saham Amerika — ${horizonLabel[horizon]}`;
    }
    if (assetClass === "global") {
      return `Saham Global — ${horizonLabel[horizon]}`;
    }
    if (assetClass === "bonds") {
      return `Obligasi — ${horizonLabel[horizon]}`;
    }
    return `Reksadana, MMF & ETF — ${horizonLabel[horizon]}`;
  }, [assetClass, horizon]);

  return (
    <main className="container-shell py-7 animate-fadeUp">
      <DashboardHeader />

      <AssetClassTabs value={assetTab} onChange={setAssetTab} />

      <SummaryCards assets={filteredAssets} />

      {assetClass === "stocks" && (
        <SectorFilter
          label="Filter sektor"
          value={stockSector}
          options={stockSectorOptions}
          onChange={setStockSector}
        />
      )}

      {assetClass === "us" && (
        <SectorFilter
          label="Filter sektor"
          value={usSector}
          options={US_SECTOR_OPTIONS}
          onChange={setUsSector}
        />
      )}

      {assetClass === "global" && (
        <SectorFilter
          label="Filter sektor / region"
          value={globalFilter}
          options={GLOBAL_FILTER_OPTIONS}
          onChange={setGlobalFilter}
        />
      )}

      <HorizonTabs value={horizon} onChange={setHorizon} />

      <p className="mb-3 flex items-center gap-2 text-[9.5px] font-medium uppercase tracking-[.1em] text-grove-muted">
        {tableLabel}
        <span className="flex-1 border-t border-grove-border" />
      </p>

      <StockTable rows={sortedRows} assetClass={assetClass} horizon={horizon} />
    </main>
  );
}
