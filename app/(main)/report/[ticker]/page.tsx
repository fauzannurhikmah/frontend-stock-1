import { createElement } from "react";
import { ReportClient } from "@/app/(main)/report/[ticker]/ReportClient";
import {
  fetchStockDetail,
  mapStockDetailToResearchAsset,
} from "@/lib/stocks-api";

export default async function ReportPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const detail = await fetchStockDetail(ticker);
  const asset = detail ? mapStockDetailToResearchAsset(detail) : null;

  return createElement(ReportClient, { ticker, asset });
}
