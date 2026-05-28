"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AssetTab,
  ResearchAsset,
  ResearchAssetClass,
  ResearchHorizon,
} from "@/lib/types";
import { researchAssets } from "@/data/researchData";
import { DashboardHeader } from "@/components/research/DashboardHeader";
import { AssetClassTabs } from "@/components/research/AssetClassTabs";
import { SummaryCards } from "@/components/research/SummaryCards";
import { SectorFilter } from "@/components/research/SectorFilter";
import { HorizonTabs } from "@/components/research/Horizontabs";
import { StockTable } from "@/components/research/StockTable";
import { getSectorOptions } from "@/lib/sectors-api";
import { fetchStocks, mapStockItemToResearchAsset } from "@/lib/stocks-api";
import {
  GLOBAL_FILTER_OPTIONS,
  US_SECTOR_OPTIONS,
  getGlobalRegionGroup,
  getGlobalSectorGroup,
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
const STOCK_PAGE_SIZE = 20;

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
  const [stockRows, setStockRows] = useState<ResearchAsset[]>([]);
  const [stockPage, setStockPage] = useState(1);
  const [stockHasNextPage, setStockHasNextPage] = useState(false);
  const [stockTotalItems, setStockTotalItems] = useState<number | null>(null);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);

  const assetClass = assetClassMap[assetTab];
  const stockSectorLabel = useMemo(() => {
    if (stockSector === "all") return null;
    return (
      stockSectorOptions.find((option) => option.key === stockSector)?.label ??
      null
    );
  }, [stockSector, stockSectorOptions]);

  const localFilteredAssets = useMemo(() => {
    let assets = researchAssets.filter(
      (asset) => asset.assetClass === assetClass,
    );

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
  }, [assetClass, globalFilter, usSector]);

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

  useEffect(() => {
    if (assetClass !== "stocks") {
      return;
    }

    const controller = new AbortController();

    setStockLoading(true);
    setStockError(null);

    fetchStocks({
      page: stockPage,
      pageSize: STOCK_PAGE_SIZE,
      sector: stockSectorLabel,
      signal: controller.signal,
    })
      .then(({ items, hasNextPage, totalItems }) => {
        if (controller.signal.aborted) return;

        const mappedRows = items
          .map(mapStockItemToResearchAsset)
          .filter((item): item is ResearchAsset => item !== null);

        setStockRows(mappedRows);
        setStockHasNextPage(hasNextPage);
        setStockTotalItems(totalItems);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;

        setStockRows([]);
        setStockHasNextPage(false);
        setStockTotalItems(null);
        setStockError(
          error instanceof Error ? error.message : "Gagal memuat data emiten",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setStockLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [assetClass, stockPage, stockSectorLabel]);

  useEffect(() => {
    if (assetClass === "stocks") {
      setStockPage(1);
    }
  }, [assetClass]);

  const handleAssetTabChange = (next: AssetTab) => {
    setAssetTab(next);
    if (next === "indonesia") {
      setStockPage(1);
    }
  };

  const handleStockSectorChange = (next: string) => {
    setStockSector(next);
    setStockPage(1);
  };

  const sortedLocalRows = useMemo(
    () =>
      [...localFilteredAssets].sort((a, b) => b[horizon].score - a[horizon].score),
    [horizon, localFilteredAssets],
  );

  const sortedStockRows = useMemo(
    () =>
      [...stockRows].sort((a, b) => b[horizon].score - a[horizon].score),
    [horizon, stockRows],
  );

  const visibleAssets =
    assetClass === "stocks" ? sortedStockRows : sortedLocalRows;

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
    <main className= "container-shell py-7 animate-fadeUp" >
    <DashboardHeader />

    < AssetClassTabs value = { assetTab } onChange = { handleAssetTabChange } />

      <SummaryCards assets={ visibleAssets } />

  {
    assetClass === "stocks" && (
      <SectorFilter
          label="Filter sektor"
    value = { stockSector }
    options = { stockSectorOptions }
    onChange = { handleStockSectorChange }
      />
      )
  }

  {
    assetClass === "us" && (
      <SectorFilter
          label="Filter sektor"
    value = { usSector }
    options = { US_SECTOR_OPTIONS }
    onChange = { setUsSector }
      />
      )
  }

  {
    assetClass === "global" && (
      <SectorFilter
          label="Filter sektor / region"
    value = { globalFilter }
    options = { GLOBAL_FILTER_OPTIONS }
    onChange = { setGlobalFilter }
      />
      )
  }

  <HorizonTabs value={ horizon } onChange = { setHorizon } />

    <p className="mb-3 flex items-center gap-2 text-[9.5px] font-medium uppercase tracking-[.1em] text-grove-muted" >
      { tableLabel }
      < span className = "flex-1 border-t border-grove-border" />
        </p>

        < StockTable
  rows = { visibleAssets }
  assetClass = { assetClass }
  horizon = { horizon }
  loading = { assetClass === "stocks" && stockLoading
}
error = { assetClass === "stocks" ? stockError : null}
pagination = {
  assetClass === "stocks"
  ? {
    page: stockPage,
    pageSize: STOCK_PAGE_SIZE,
    hasNextPage: stockHasNextPage,
    totalItems: stockTotalItems,
    onPageChange: setStockPage,
  }
  : undefined
        }
rowOffset = { assetClass === "stocks" ? (stockPage - 1) * STOCK_PAGE_SIZE : 0}
      />
  </main>
  );
}
