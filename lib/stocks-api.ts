import { API_BASE_URL } from "@/lib/env";
import { hashTicker } from "@/lib/research-utils";
import { ResearchAsset, ResearchHorizon, ResearchStance } from "@/lib/types";

export interface StockListingApiItem {
    listing?: {
        symbol?: string | null;
    };
    company?: {
        displayName?: string | null;
        legalName?: string | null;
        logoUrl?: string | null;
    };
    sector?: {
        name?: string | null;
    };
    latestStockPrice?: {
        open?: string | null;
        close?: string | null;
    };
    priceComparison?: {
        latestClose?: string | null;
        previousClose?: string | null;
        change?: string | null;
        changePct?: string | null;
        direction?: string | null;
    };
    marketCap?: string | null;
    country?: {
        name?: string | null;
    };
}

export interface StocksQueryParams {
    page: number;
    pageSize: number;
    sector?: string | null;
    signal?: AbortSignal;
}

export interface StocksResponse {
    items: StockListingApiItem[];
    totalItems: number | null;
    hasNextPage: boolean;
}

export interface StockDetailApiResponse extends StockListingApiItem {
    exchange?: {
        code?: string | null;
        name?: string | null;
        timezone?: string | null;
        exchangeType?: string | null;
    };
    industry?: {
        name?: string | null;
    };
    latestStockPrice?: {
        date?: string | null;
        open?: string | null;
        high?: string | null;
        low?: string | null;
        close?: string | null;
        adjClose?: string | null;
        volume?: string | null;
        value?: string | null;
    };
    priceComparison?: {
        latestDate?: string | null;
        latestClose?: string | null;
        previousDate?: string | null;
        previousClose?: string | null;
        change?: string | null;
        changePct?: string | null;
        direction?: string | null;
    };
    marketCap?: string | null;
}

const numberFormatter = new Intl.NumberFormat("id-ID");

function parseNumber(value: string | null | undefined) {
    if (!value) return null;
    const normalized = value.replace(/[^0-9.-]/g, "");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
}

function formatCurrency(value: number | null) {
    if (value === null) return "-";
    return `Rp ${numberFormatter.format(Math.round(value))}`;
}

function formatChange(openPrice: number | null, closePrice: number | null) {
    if (openPrice === null || closePrice === null || openPrice === 0) {
        return "+0.0%";
    }

    const delta = closePrice - openPrice;
    const pct = (delta / openPrice) * 100;
    const sign = pct >= 0 ? "+" : "";
    return `${sign}${pct.toFixed(1)}%`;
}

function formatComparisonChange(
    changePct: string | null | undefined,
    direction: string | null | undefined,
    latestClose: number | null,
    previousClose: number | null,
) {
    const parsedPct = changePct ? Number(changePct) : null;
    if (parsedPct !== null && Number.isFinite(parsedPct)) {
        const pct = parsedPct;
        const sign = pct >= 0 ? "+" : "";
        return `${sign}${pct.toFixed(2)}%`;
    }

    if (latestClose === null || previousClose === null || previousClose === 0) {
        return direction === "UP" ? "+0.00%" : "-0.00%";
    }

    const pct = ((latestClose - previousClose) / previousClose) * 100;
    const sign = pct >= 0 ? "+" : "";
    return `${sign}${pct.toFixed(2)}%`;
}

function getSectorColorKey(sectorName: string) {
    const normalized = sectorName.trim().toLowerCase();

    if (
        normalized.includes("bank") ||
        normalized.includes("keuangan") ||
        normalized.includes("financial")
    ) {
        return "banking";
    }
    if (
        normalized.includes("energy") ||
        normalized.includes("energi") ||
        normalized.includes("oil") ||
        normalized.includes("gas") ||
        normalized.includes("coal") ||
        normalized.includes("batu bara")
    ) {
        return "energy";
    }
    if (
        normalized.includes("telco") ||
        normalized.includes("telekom") ||
        normalized.includes("communication") ||
        normalized.includes("komunikasi")
    ) {
        return "telco";
    }
    if (
        normalized.includes("consumer") ||
        normalized.includes("konsumen") ||
        normalized.includes("retail")
    ) {
        return "consumer";
    }
    if (
        normalized.includes("mining") ||
        normalized.includes("pertambangan") ||
        normalized.includes("commodity")
    ) {
        return "mining";
    }
    if (
        normalized.includes("property") ||
        normalized.includes("real estate") ||
        normalized.includes("properti")
    ) {
        return "property";
    }
    if (normalized.includes("auto") || normalized.includes("otomotif")) {
        return "auto";
    }
    if (
        normalized.includes("infra") ||
        normalized.includes("infrastruktur") ||
        normalized.includes("utilities")
    ) {
        return "infra";
    }
    if (
        normalized.includes("health") ||
        normalized.includes("kesehatan") ||
        normalized.includes("pharma")
    ) {
        return "health";
    }
    if (
        normalized.includes("tech") ||
        normalized.includes("teknologi") ||
        normalized.includes("technology")
    ) {
        return "tech";
    }

    return "intl";
}

function buildHorizonData(ticker: string, horizon: ResearchHorizon) {
    const seed = hashTicker(`${ticker}:${horizon}`);
    const score = 42 + (seed % 49);
    const probability = 38 + ((seed >> 3) % 41);
    const negative = Math.max(5, 100 - probability);
    const expectedReturn = ((score - 50) / 2).toFixed(1);

    const stance: ResearchStance =
        score >= 70 ? "ow" : score >= 56 ? "nt" : "uw";

    return {
        prob: probability,
        neg: negative,
        ev: `${score >= 50 ? "+" : ""}${expectedReturn}%`,
        score,
        stance,
    };
}

function buildFv(closePrice: number | null) {
    if (closePrice === null) return "-";
    return formatCurrency(closePrice * 1.05);
}

function formatIdrValue(value: number | null) {
    if (value === null) return "-";
    return numberFormatter.format(Math.round(value));
}

function formatIdrRange(minValue: number | null, maxValue: number | null) {
    if (minValue === null || maxValue === null) return "-";
    return `${formatIdrValue(minValue)}-${formatIdrValue(maxValue)}`;
}

export function mapStockItemToResearchAsset(
    item: StockListingApiItem,
): ResearchAsset | null {
    const ticker = item.listing?.symbol?.trim();
    if (!ticker) return null;

    const sectorName = item.sector?.name?.trim() || "Sektor tidak diketahui";
    const companyName =
        item.company?.displayName?.trim() ||
        item.company?.legalName?.trim() ||
        ticker;
    const openPrice = parseNumber(item.latestStockPrice?.open);
    const closePrice = parseNumber(item.latestStockPrice?.close);
    const latestClose = parseNumber(item.priceComparison?.latestClose) ?? closePrice;
    const previousClose = parseNumber(item.priceComparison?.previousClose);
    const marketCap = parseNumber(item.marketCap);
    const color = getSectorColorKey(sectorName);
    const change = formatComparisonChange(
        item.priceComparison?.changePct,
        item.priceComparison?.direction,
        latestClose,
        previousClose,
    );
    const price = formatCurrency(latestClose ?? closePrice ?? openPrice);

    return {
        ticker,
        name: companyName,
        sector: sectorName,
        color,
        logoUrl: item.company?.logoUrl?.trim() || null,
        assetClass: "stocks",
        price,
        change,
        fv: buildFv(latestClose ?? closePrice ?? openPrice),
        intlSector: null,
        region: item.country?.name?.trim() || null,
        isSmallCap: marketCap !== null ? marketCap < 10_000_000_000_000 : undefined,
        lt: buildHorizonData(ticker, "lt"),
        mt: buildHorizonData(ticker, "mt"),
        st: buildHorizonData(ticker, "st"),
    };
}

export function mapStockDetailToResearchAsset(
    item: StockDetailApiResponse,
): ResearchAsset | null {
    const ticker = item.listing?.symbol?.trim();
    if (!ticker) return null;

    const sectorName = item.sector?.name?.trim() || "Sektor tidak diketahui";
    const companyName =
        item.company?.displayName?.trim() ||
        item.company?.legalName?.trim() ||
        ticker;
    const latestClose =
        parseNumber(item.priceComparison?.latestClose) ??
        parseNumber(item.latestStockPrice?.close);
    const previousClose = parseNumber(item.priceComparison?.previousClose);
    const marketCap = parseNumber(item.marketCap);
    const color = getSectorColorKey(sectorName);
    const change = formatComparisonChange(
        item.priceComparison?.changePct,
        item.priceComparison?.direction,
        latestClose,
        previousClose,
    );

    const fairValueBase = latestClose !== null ? latestClose * 1.08 : null;

    return {
        ticker,
        name: companyName,
        sector: sectorName,
        color,
        logoUrl: item.company?.logoUrl?.trim() || null,
        assetClass: "stocks",
        price: formatIdrValue(latestClose),
        change,
        fv:
            fairValueBase === null
                ? "-"
                : formatIdrRange(fairValueBase * 0.95, fairValueBase * 1.05),
        intlSector: item.industry?.name?.trim() || null,
        region: item.country?.name?.trim() || null,
        isSmallCap: marketCap !== null ? marketCap < 10_000_000_000_000 : undefined,
        lt: buildHorizonData(ticker, "lt"),
        mt: buildHorizonData(ticker, "mt"),
        st: buildHorizonData(ticker, "st"),
    };
}

function extractItems(payload: unknown) {
    if (Array.isArray(payload)) return payload;

    if (typeof payload === "object" && payload !== null) {
        const record = payload as Record<string, unknown>;
        if (Array.isArray(record.items)) return record.items;
        if (Array.isArray(record.data)) return record.data;
    }

    return [];
}

function extractTotalItems(payload: unknown) {
    if (typeof payload !== "object" || payload === null) return null;

    const record = payload as Record<string, unknown>;
    const candidates = [
        record.totalItems,
        record.total,
        record.count,
        (record.meta as Record<string, unknown> | undefined)?.total,
        (record.pagination as Record<string, unknown> | undefined)?.total,
        (record.pageInfo as Record<string, unknown> | undefined)?.total,
    ];

    for (const candidate of candidates) {
        if (typeof candidate === "number" && Number.isFinite(candidate)) {
            return candidate;
        }
    }

    return null;
}

export async function fetchStocks({
    page,
    pageSize,
    sector,
    signal,
}: StocksQueryParams): Promise<StocksResponse> {
    const query = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
    });

    if (sector) {
        query.set("sector", sector);
    }

    const response = await fetch(`${API_BASE_URL}/stocks?${query.toString()}`, {
        headers: { Accept: "application/json" },
        signal,
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch stocks: HTTP ${response.status}`);
    }

    const payload = (await response.json()) as unknown;
    const items = extractItems(payload).filter(
        (item): item is StockListingApiItem =>
            typeof item === "object" && item !== null,
    );

    const totalItems = extractTotalItems(payload);
    const hasNextPage =
        typeof totalItems === "number"
            ? page * pageSize < totalItems
            : items.length === pageSize;

    return { items, totalItems, hasNextPage };
}

export async function fetchStockDetail(
    ticker: string,
): Promise<StockDetailApiResponse | null> {
    const normalizedTicker = ticker.trim().toLowerCase();
    if (!normalizedTicker) return null;

    const response = await fetch(
        `${API_BASE_URL}/stocks/${encodeURIComponent(normalizedTicker)}`,
        {
            headers: { Accept: "application/json" },
            cache: "no-store",
        },
    );

    if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch stock detail: HTTP ${response.status}`);
    }

    const payload = (await response.json()) as unknown;
    if (typeof payload !== "object" || payload === null) return null;

    return payload as StockDetailApiResponse;
}