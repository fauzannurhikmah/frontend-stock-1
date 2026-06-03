"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ColorType,
    CrosshairMode,
    createChart,
    CandlestickSeries,
    LineSeries,
    HistogramSeries,
    type CandlestickData,
    type IChartApi,
    type ISeriesApi,
    type UTCTimestamp,
} from "lightweight-charts";
import { Maximize2, BarChart2, ChevronDown, Check } from "lucide-react";
import { API_BASE_URL } from "@/lib/env";
import { COLOR_MAP } from "@/lib/research-utils";
import { ResearchAsset } from "@/lib/types";
import { ChartExpandModal } from "./Chartexpandmodal";

// ─── Types ────────────────────────────────────────────────────────────────────

type IndicatorKey = "ma50" | "ma200" | "volume";

const INDICATOR_OPTIONS: { key: IndicatorKey; label: string; description: string }[] = [
    { key: "ma50", label: "MA 50", description: "Moving Average 50 hari" },
    { key: "ma200", label: "MA 200", description: "Moving Average 200 hari" },
    { key: "volume", label: "Volume", description: "Volume bar di bawah chart" },
];

type CandlePoint = {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
};

type HoveredOHLCV = {
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    time: number;
} | null;

type CandlesResponse = {
    ticker?: string;
    interval?: string;
    candles?: CandlePoint[];
    hasMore?: boolean;
    before?: number;
};

type TechnicalSummaryResponse = {
    company?: {
        legalName?: string;
        displayName?: string;
    };
    meta?: {
        period?: {
            range?: string;
            interval?: string;
            to?: string;
        };
    };
    overview?: {
        snapshot?: {
            date?: string;
            close?: string;
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
        ma50?: string;
        ma200?: string;
        rsi14?: string;
        avgVolume30?: string;
        latestVolume?: string;
    };
};

// ─── Constants ────────────────────────────────────────────────────────────────

const SUMMARY_RANGE = "2y";
const SUMMARY_INTERVAL = "1mo";
const CANDLES_INTERVAL = "1d";
const CANDLES_LIMIT = 365;
const LEFT_EDGE_THRESHOLD = 24;
const INITIAL_VISIBLE_POINTS = 120;

type VisibleRange = { from: number; to: number };

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatNumber(value: string | number | null | undefined) {
    const parsed =
        typeof value === "number"
            ? value
            : Number.parseFloat(String(value ?? "").replace(/[^0-9.-]/g, ""));

    if (Number.isNaN(parsed)) return "-";
    return new Intl.NumberFormat("id-ID").format(parsed);
}

function formatCurrency(value: string | number | null | undefined) {
    const formatted = formatNumber(value);
    return formatted === "-" ? formatted : `Rp ${formatted}`;
}

function formatDateLabel(value: string | number) {
    const date = typeof value === "number" ? new Date(value * 1000) : new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

function formatChartPrice(value: number) {
    return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value);
}

function formatVolume(value: number) {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return String(value);
}

function getApiErrorMessage(fallback: string, status?: number) {
    return status ? `${fallback} (${status})` : fallback;
}

function toChartCandles(candles: CandlePoint[]): CandlestickData<UTCTimestamp>[] {
    return candles.map((candle) => ({
        time: candle.time as UTCTimestamp,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
    }));
}

function mergeCandles(existing: CandlePoint[], older: CandlePoint[]) {
    const seen = new Set(existing.map((item) => item.time));
    const merged = [...older.filter((item) => !seen.has(item.time)), ...existing];
    merged.sort((left, right) => left.time - right.time);
    return merged;
}

function computeMA(candles: CandlePoint[], period: number) {
    return candles
        .map((c, i) => {
            if (i < period - 1) return null;
            const slice = candles.slice(i - period + 1, i + 1);
            const avg = slice.reduce((s, x) => s + x.close, 0) / period;
            return { time: c.time as UTCTimestamp, value: avg };
        })
        .filter(Boolean) as { time: UTCTimestamp; value: number }[];
}

function toVolumeData(candles: CandlePoint[], upColor: string) {
    return candles.map((c) => ({
        time: c.time as UTCTimestamp,
        value: c.volume,
        color: c.close >= c.open ? upColor + "99" : "#e0484899",
    }));
}

// ─── OHLCV Tooltip (inline, compact) ─────────────────────────────────────────

function OHLCVTooltip({ data, accent }: { data: HoveredOHLCV; accent: string }) {
    if (!data) return null;

    const isUp = data.close >= data.open;
    const changeAbs = data.close - data.open;
    const changePct = ((changeAbs / data.open) * 100).toFixed(2);
    const changeColor = isUp ? accent : "#e04848";

    return (
        <div
            style={{
                position: "absolute",
                top: 8,
                left: 8,
                zIndex: 20,
                background: "rgba(18, 25, 26, 0.90)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 7,
                padding: "5px 9px",
                backdropFilter: "blur(6px)",
                pointerEvents: "none",
                minWidth: 130,
            }}
        >
            <div
                style={{
                    fontSize: 9,
                    color: "rgba(255,255,255,0.38)",
                    marginBottom: 3,
                    fontFamily: "Inter, sans-serif",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                }}
            >
                {formatDateLabel(data.time)}
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "2px 10px",
                }}
            >
                {(
                    [
                        { label: "O", value: data.open },
                        { label: "H", value: data.high },
                        { label: "C", value: data.close },
                        { label: "L", value: data.low },
                    ] as const
                ).map(({ label, value }) => (
                    <div
                        key={label}
                        style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: 3,
                            fontFamily: "Inter, sans-serif",
                        }}
                    >
                        <span
                            style={{
                                fontSize: 9,
                                color: "rgba(255,255,255,0.32)",
                                fontWeight: 600,
                                minWidth: 9,
                            }}
                        >
                            {label}
                        </span>
                        <span
                            style={{
                                fontSize: 10,
                                color: label === "C" ? changeColor : "rgba(255,255,255,0.78)",
                                fontWeight: label === "C" ? 600 : 400,
                            }}
                        >
                            {formatChartPrice(value)}
                        </span>
                    </div>
                ))}
            </div>

            <div
                style={{
                    marginTop: 4,
                    paddingTop: 4,
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 6,
                    fontFamily: "Inter, sans-serif",
                }}
            >
                <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.30)", fontWeight: 600 }}>
                        VOL
                    </span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.65)" }}>
                        {formatVolume(data.volume)}
                    </span>
                </div>
                <span style={{ fontSize: 9, color: changeColor, fontWeight: 600 }}>
                    {isUp ? "+" : ""}
                    {changePct}%
                </span>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TechnicalSection({ asset }: { asset: ResearchAsset }) {
    const accent = COLOR_MAP[asset.color] ?? "#5FB88A";

    const [candles, setCandles] = useState<CandlePoint[]>([]);
    const [summary, setSummary] = useState<TechnicalSummaryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showIndicatorMenu, setShowIndicatorMenu] = useState(false);
    const [activeIndicators, setActiveIndicators] = useState<Set<IndicatorKey>>(new Set());
    const [hoveredOHLCV, setHoveredOHLCV] = useState<HoveredOHLCV>(null);

    const indicatorMenuRef = useRef<HTMLDivElement | null>(null);
    const chartContainerRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const ma50SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
    const ma200SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

    const candlesRef = useRef<CandlePoint[]>([]);
    const hasMoreRef = useRef(false);
    const loadingMoreRef = useRef(false);
    const initialVisibleRangeAppliedRef = useRef(false);
    const pendingVisibleRangeRef = useRef<VisibleRange | null>(null);
    const pendingShiftRef = useRef(0);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    useEffect(() => { candlesRef.current = candles; }, [candles]);
    useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
    useEffect(() => { loadingMoreRef.current = loadingMore; }, [loadingMore]);

    // ── Data fetching ──────────────────────────────────────────────────────────
    useEffect(() => {
        const controller = new AbortController();

        setLoading(true);
        setLoadingMore(false);
        setHasMore(false);
        setError(null);
        setCandles([]);
        setSummary(null);
        candlesRef.current = [];
        hasMoreRef.current = false;
        loadingMoreRef.current = false;
        initialVisibleRangeAppliedRef.current = false;
        pendingVisibleRangeRef.current = null;
        pendingShiftRef.current = 0;

        async function loadTechnicalData() {
            try {
                const symbol = encodeURIComponent(asset.ticker.toLowerCase());
                const [candlesResponse, summaryResponse] = await Promise.all([
                    fetch(
                        `${API_BASE_URL}/stocks/${symbol}/candles?interval=${CANDLES_INTERVAL}&limit=${CANDLES_LIMIT}`,
                        { signal: controller.signal },
                    ),
                    fetch(
                        `${API_BASE_URL}/stocks/${symbol}/technical-summary?range=${SUMMARY_RANGE}&interval=${SUMMARY_INTERVAL}`,
                        { signal: controller.signal },
                    ),
                ]);

                if (!candlesResponse.ok) throw new Error(getApiErrorMessage("Gagal memuat candle series", candlesResponse.status));
                if (!summaryResponse.ok) throw new Error(getApiErrorMessage("Gagal memuat technical summary", summaryResponse.status));

                const candlesData = (await candlesResponse.json()) as CandlesResponse;
                const summaryData = (await summaryResponse.json()) as TechnicalSummaryResponse;

                const nextCandles = [...(candlesData.candles ?? [])].sort(
                    (l, r) => l.time - r.time,
                );

                setCandles(nextCandles);
                setHasMore(Boolean(candlesData.hasMore));
                setSummary(summaryData);
            } catch (fetchError) {
                if (controller.signal.aborted) return;
                setCandles([]);
                setSummary(null);
                setHasMore(false);
                setError(fetchError instanceof Error ? fetchError.message : "Gagal memuat analisis teknikal");
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }

        void loadTechnicalData();
        return () => { controller.abort(); };
    }, [asset.ticker]);

    // ── Close indicator menu on outside click ──────────────────────────────────
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (indicatorMenuRef.current && !indicatorMenuRef.current.contains(e.target as Node)) {
                setShowIndicatorMenu(false);
            }
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const toggleIndicator = (key: IndicatorKey) => {
        setActiveIndicators((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    // ── Load older candles ─────────────────────────────────────────────────────
    const loadOlderCandles = useCallback(async () => {
        if (loadingMoreRef.current || !hasMoreRef.current || !candlesRef.current.length) return;

        const oldestCandle = candlesRef.current[0];
        const currentRange = chartRef.current?.timeScale().getVisibleLogicalRange() ?? null;

        setLoadingMore(true);
        loadingMoreRef.current = true;
        pendingVisibleRangeRef.current = currentRange
            ? { from: currentRange.from, to: currentRange.to }
            : null;

        try {
            const symbol = encodeURIComponent(asset.ticker.toLowerCase());
            const response = await fetch(
                `${API_BASE_URL}/stocks/${symbol}/candles?interval=${CANDLES_INTERVAL}&limit=${CANDLES_LIMIT}&before=${oldestCandle.time}`,
            );

            if (!response.ok) throw new Error(getApiErrorMessage("Gagal memuat candle historis", response.status));

            const responseData = (await response.json()) as CandlesResponse;
            const olderCandles = [...(responseData.candles ?? [])].sort((l, r) => l.time - r.time);

            if (!mountedRef.current) return;

            if (!olderCandles.length) {
                setHasMore(Boolean(responseData.hasMore));
                return;
            }

            const mergedCandles = mergeCandles(candlesRef.current, olderCandles);
            pendingShiftRef.current = mergedCandles.length - candlesRef.current.length;
            setCandles(mergedCandles);
            setHasMore(Boolean(responseData.hasMore));
        } catch (fetchError) {
            if (!mountedRef.current) return;
            if (fetchError instanceof Error) setError(fetchError.message);
        } finally {
            loadingMoreRef.current = false;
            if (mountedRef.current) setLoadingMore(false);
        }
    }, [asset.ticker]);

    // ── Build main chart ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!chartContainerRef.current || chartRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            autoSize: false,
            width: chartContainerRef.current.clientWidth,
            height: 260,
            layout: {
                background: { type: ColorType.Solid, color: "#12191a" },
                textColor: "#94a89a",
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
            },
            grid: {
                vertLines: { color: "rgba(255, 255, 255, 0.04)" },
                horzLines: { color: "rgba(255, 255, 255, 0.04)" },
            },
            rightPriceScale: { borderColor: "rgba(255, 255, 255, 0.08)" },
            timeScale: {
                borderColor: "rgba(255, 255, 255, 0.08)",
                timeVisible: true,
                secondsVisible: false,
                rightOffset: 8,
                barSpacing: 8,
                fixLeftEdge: true,
            },
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: { color: "rgba(255,255,255,0.24)", width: 1, style: 2, labelBackgroundColor: "#1e2d23" },
                horzLine: { color: "rgba(255,255,255,0.24)", width: 1, style: 2, labelBackgroundColor: "#1e2d23" },
            },
            localization: { priceFormatter: formatChartPrice },
        });

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: accent,
            downColor: "#e04848",
            borderUpColor: accent,
            borderDownColor: "#e04848",
            wickUpColor: accent,
            wickDownColor: "#e04848",
        });

        chartRef.current = chart;
        candleSeriesRef.current = candlestickSeries;

        // OHLCV crosshair subscription
        chart.subscribeCrosshairMove((param) => {
            if (!param || !param.time || !param.seriesData) {
                setHoveredOHLCV(null);
                return;
            }
            const barData = param.seriesData.get(candlestickSeries) as
                | { open: number; high: number; low: number; close: number }
                | undefined;
            if (!barData) {
                setHoveredOHLCV(null);
                return;
            }
            const ts = param.time as number;
            const found = candlesRef.current.find((c) => c.time === ts);
            setHoveredOHLCV({
                open: barData.open,
                high: barData.high,
                low: barData.low,
                close: barData.close,
                volume: found?.volume ?? 0,
                time: ts,
            });
        });

        // Resize observer
        const resizeObserver = new ResizeObserver(() => {
            if (!chartContainerRef.current) return;
            chart.resize(
                Math.max(1, Math.floor(chartContainerRef.current.clientWidth)),
                Math.max(1, Math.floor(chartContainerRef.current.clientHeight)),
                true,
            );
        });
        resizeObserver.observe(chartContainerRef.current);

        // Scroll-left to load more
        const handleVisibleRangeChange = (range: VisibleRange | null) => {
            if (!range || loadingMoreRef.current || !hasMoreRef.current || range.from > LEFT_EDGE_THRESHOLD) return;
            void loadOlderCandles();
        };
        chart.timeScale().subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);

        if (candlesRef.current.length > 0) {
            candlestickSeries.setData(toChartCandles(candlesRef.current));
            const start = Math.max(0, candlesRef.current.length - INITIAL_VISIBLE_POINTS);
            chart.timeScale().setVisibleLogicalRange({ from: start, to: candlesRef.current.length + 8 });
            initialVisibleRangeAppliedRef.current = true;
        }

        return () => {
            chart.timeScale().unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
            resizeObserver.disconnect();
            chart.remove();
            chartRef.current = null;
            candleSeriesRef.current = null;
        };
    }, [accent, loadOlderCandles, loading]);

    // ── Sync candle data into existing chart ───────────────────────────────────
    useEffect(() => {
        if (!chartRef.current || !candleSeriesRef.current || !candles.length) return;

        candleSeriesRef.current.setData(toChartCandles(candles));

        if (!initialVisibleRangeAppliedRef.current) {
            const start = Math.max(0, candles.length - INITIAL_VISIBLE_POINTS);
            chartRef.current.timeScale().setVisibleLogicalRange({ from: start, to: candles.length + 8 });
            initialVisibleRangeAppliedRef.current = true;
            pendingVisibleRangeRef.current = null;
            pendingShiftRef.current = 0;
            return;
        }

        if (pendingVisibleRangeRef.current) {
            const nextRange = pendingVisibleRangeRef.current;
            const shift = pendingShiftRef.current;
            chartRef.current.timeScale().setVisibleLogicalRange({
                from: nextRange.from + shift,
                to: nextRange.to + shift,
            });
            pendingVisibleRangeRef.current = null;
            pendingShiftRef.current = 0;
        }
    }, [candles]);

    // ── Manage indicator series on main chart ──────────────────────────────────
    useEffect(() => {
        const chart = chartRef.current;
        if (!chart || !candles.length) return;

        if (activeIndicators.has("ma50")) {
            if (!ma50SeriesRef.current) {
                const s = chart.addSeries(LineSeries, {
                    color: "#f5c842", lineWidth: 1,
                    priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false,
                });
                s.setData(computeMA(candles, 50));
                ma50SeriesRef.current = s;
            }
        } else {
            if (ma50SeriesRef.current) { chart.removeSeries(ma50SeriesRef.current); ma50SeriesRef.current = null; }
        }

        if (activeIndicators.has("ma200")) {
            if (!ma200SeriesRef.current) {
                const s = chart.addSeries(LineSeries, {
                    color: "#e06de0", lineWidth: 1,
                    priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false,
                });
                s.setData(computeMA(candles, 200));
                ma200SeriesRef.current = s;
            }
        } else {
            if (ma200SeriesRef.current) { chart.removeSeries(ma200SeriesRef.current); ma200SeriesRef.current = null; }
        }

        if (activeIndicators.has("volume")) {
            if (!volumeSeriesRef.current) {
                const s = chart.addSeries(HistogramSeries, {
                    priceFormat: { type: "volume" },
                    priceScaleId: "volume",
                    priceLineVisible: false,
                    lastValueVisible: false,
                });
                s.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
                s.setData(toVolumeData(candles, accent));
                volumeSeriesRef.current = s;
            }
        } else {
            if (volumeSeriesRef.current) { chart.removeSeries(volumeSeriesRef.current); volumeSeriesRef.current = null; }
        }
    }, [activeIndicators, candles, accent]);

    // ── Derived display values ─────────────────────────────────────────────────
    const latestPoint = candles[candles.length - 1];
    const summaryMeta = summary?.meta;
    const snapshot = summary?.overview?.snapshot;
    const indicators = summary?.overview?.indicators;
    const wyckoff = summary?.wyckoff;
    const wyckoffIndicators = summary?.wyckoffIndicators;
    const companyName =
        summary?.company?.displayName?.trim() || summary?.company?.legalName?.trim() || asset.name;
    const periodRange = summaryMeta?.period?.range ?? SUMMARY_RANGE;
    const periodInterval = summaryMeta?.period?.interval ?? SUMMARY_INTERVAL;
    const periodTo = summaryMeta?.period?.to
        ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(
            new Date(summaryMeta.period.to),
        )
        : null;
    const latestClose = snapshot?.close ?? latestPoint?.close;
    const latestVolume = wyckoffIndicators?.latestVolume ?? snapshot?.volume ?? latestPoint?.volume;
    const avgVolume = useMemo(() => {
        if (wyckoffIndicators?.avgVolume30) return wyckoffIndicators.avgVolume30;
        const recentCandles = candles.slice(-30);
        if (!recentCandles.length) return null;
        return recentCandles.reduce((sum, c) => sum + c.volume, 0) / recentCandles.length;
    }, [candles, wyckoffIndicators?.avgVolume30]);
    const chartDateLabel = summary?.wyckoffIndicators?.asOf ?? snapshot?.date ?? latestPoint?.time;
    const signal = summary?.overview?.signal ?? "-";
    const phase = wyckoff?.phase ?? "-";
    const confidence = typeof wyckoff?.confidence === "number" ? `${Math.round(wyckoff.confidence * 100)}%` : "-";
    const notes = wyckoff?.notes ?? [];
    const rsiValue = Number.parseFloat(wyckoffIndicators?.rsi14 ?? indicators?.rsi14 ?? "");
    const rsiTone = Number.isNaN(rsiValue)
        ? "var(--muted2)"
        : rsiValue > 70
            ? "var(--red)"
            : rsiValue < 35
                ? "var(--green)"
                : "var(--amber)";

    // ── Loading / error states ─────────────────────────────────────────────────
    if (loading && !summary) {
        return (
            <div className="placeholder">
                <h3>Memuat analisis teknikal</h3>
                <p>Data candle dan Wyckoff untuk {asset.ticker} sedang diambil dari API.</p>
            </div>
        );
    }

    if (error || !summary || !candles.length) {
        return (
            <div className="placeholder">
                <h3>Data teknikal belum tersedia</h3>
                <p>{error || `Analisis teknikal untuk ${asset.ticker} sedang disiapkan.`}</p>
            </div>
        );
    }

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <section className="tek-wrap">
            <div className="tek-wyckoff">
                <div className="tek-wyckoff-title">Analisis Wyckoff — {companyName}</div>
                <div className="tek-wyckoff-sub">
                    Range {periodRange} · interval {periodInterval}
                    {periodTo ? ` · updated ${periodTo}` : ""}
                </div>

                <div className="tek-indicators">
                    <div className="tek-ind">
                        <div className="tek-ind-lbl">Snapshot</div>
                        <div className="tek-ind-val" style={{ fontSize: "12px" }}>
                            {formatCurrency(latestClose)}
                        </div>
                        <div className="tek-ind-sig" style={{ color: "var(--muted2)" }}>
                            {chartDateLabel ? formatDateLabel(chartDateLabel) : "-"}
                        </div>
                    </div>
                    <div className="tek-ind">
                        <div className="tek-ind-lbl">Signal</div>
                        <div className="tek-ind-val" style={{ fontSize: "12px" }}>{signal}</div>
                        <div className="tek-ind-sig" style={{ color: "var(--muted2)" }}>Wyckoff summary</div>
                    </div>
                    <div className="tek-ind">
                        <div className="tek-ind-lbl">Phase</div>
                        <div className="tek-ind-val" style={{ fontSize: "12px" }}>{phase}</div>
                        <div className="tek-ind-sig" style={{ color: "var(--muted2)" }}>Confidence {confidence}</div>
                    </div>
                    <div className="tek-ind">
                        <div className="tek-ind-lbl">Volume</div>
                        <div className="tek-ind-val" style={{ fontSize: "12px" }}>
                            {formatCurrency(latestVolume)}
                        </div>
                        <div className="tek-ind-sig" style={{ color: "var(--grove)" }}>
                            Avg 30 hari {avgVolume ? `· ${formatCurrency(avgVolume)}` : ""}
                        </div>
                    </div>
                </div>

                <div className="tek-indicators">
                    <div className="tek-ind">
                        <div className="tek-ind-lbl">RSI(14)</div>
                        <div className="tek-ind-val" style={{ color: rsiTone }}>
                            {formatNumber(wyckoffIndicators?.rsi14 ?? indicators?.rsi14)}
                        </div>
                        <div className="tek-ind-sig" style={{ color: rsiTone }}>
                            {Number.isNaN(rsiValue) ? "-" : rsiValue > 70 ? "Overbought" : rsiValue < 35 ? "Oversold" : "Netral"}
                        </div>
                    </div>
                    <div className="tek-ind">
                        <div className="tek-ind-lbl">MA 50 harian</div>
                        <div className="tek-ind-val" style={{ fontSize: "12px" }}>
                            {formatCurrency(wyckoffIndicators?.ma50 ?? indicators?.ma50)}
                        </div>
                        <div className="tek-ind-sig" style={{ color: "var(--muted2)" }}>Moving Average</div>
                    </div>
                    <div className="tek-ind">
                        <div className="tek-ind-lbl">MA 200 harian</div>
                        <div className="tek-ind-val" style={{ fontSize: "12px" }}>
                            {formatCurrency(wyckoffIndicators?.ma200 ?? indicators?.ma200)}
                        </div>
                        <div className="tek-ind-sig" style={{ color: "var(--muted2)" }}>Long Term Avg</div>
                    </div>
                    <div className="tek-ind">
                        <div className="tek-ind-lbl">Volume / Hari</div>
                        <div className="tek-ind-val" style={{ fontSize: "12px" }}>
                            {formatCurrency(avgVolume ?? latestVolume)}
                        </div>
                        <div className="tek-ind-sig" style={{ color: "var(--grove)" }}>
                            {loadingMore ? "Memuat data historis lebih lama..." : "Avg 30 hari"}
                        </div>
                    </div>
                </div>

                {/* ── Chart section ──────────────────────────────────────────── */}
                <div className="tek-chart-wrap relative">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3 mb-1">
                        <div>
                            <div className="tek-chart-ttl">
                                Candlestick chart {asset.ticker} · {CANDLES_INTERVAL} · data awal {candles.length}
                            </div>
                            <div className="mt-0.5 text-[10px] text-grove-muted2">
                                Scroll ke kiri untuk memuat histori candle yang lebih lama.
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {/* Indicator dropdown */}
                            <div className="relative" ref={indicatorMenuRef}>
                                <button
                                    onClick={() => setShowIndicatorMenu((v) => !v)}
                                    className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium cursor-pointer transition-colors bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white/90"
                                >
                                    <BarChart2 size={11} />
                                    Indikator
                                    {activeIndicators.size > 0 && (
                                        <span className="bg-white/20 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-semibold">
                                            {activeIndicators.size}
                                        </span>
                                    )}
                                    <ChevronDown
                                        size={10}
                                        className={`transition-transform duration-150 ${showIndicatorMenu ? "rotate-180" : ""}`}
                                    />
                                </button>

                                {showIndicatorMenu && (
                                    <div className="absolute right-0 top-full mt-1.5 z-50 w-48 rounded-lg border border-white/10 bg-[#12191a] shadow-2xl overflow-hidden">
                                        <div className="px-3 py-2 text-[10px] text-white/40 border-b border-white/8 uppercase tracking-wider">
                                            Pilih indikator
                                        </div>
                                        {INDICATOR_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.key}
                                                onClick={() => toggleIndicator(opt.key)}
                                                className="w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors cursor-pointer hover:bg-white/5"
                                            >
                                                <div>
                                                    <div className="text-[12px] font-medium text-white/80">{opt.label}</div>
                                                    <div className="text-[10px] text-white/40">{opt.description}</div>
                                                </div>
                                                <div
                                                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${activeIndicators.has(opt.key)
                                                        ? "bg-white/90 border-white/90"
                                                        : "border-white/20"
                                                        }`}
                                                >
                                                    {activeIndicators.has(opt.key) && (
                                                        <Check size={9} className="text-black" strokeWidth={3} />
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Expand button */}
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium cursor-pointer transition-colors bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white/90"
                            >
                                <Maximize2 size={10} />
                                Perluas
                            </button>
                        </div>
                    </div>

                    {/* Chart canvas + OHLCV overlay */}
                    <div className="relative mt-3">
                        <OHLCVTooltip data={hoveredOHLCV} accent={accent} />
                        <div
                            ref={chartContainerRef}
                            role="img"
                            aria-label={`Candlestick chart for ${asset.ticker}`}
                            className="w-full"
                            style={{ height: "260px" }}
                        />
                    </div>
                </div>

                <div className="tek-analysis-rows">
                    {notes.length ? (
                        notes.map((item) => (
                            <div key={item} className="tek-row">
                                <div className="tek-row-ico" style={{ background: "var(--grove)" }} />
                                <div className="tek-row-txt" dangerouslySetInnerHTML={{ __html: item }} />
                            </div>
                        ))
                    ) : (
                        <div className="tek-row">
                            <div className="tek-row-ico" style={{ background: "var(--grove)" }} />
                            <div className="tek-row-txt">
                                Wyckoff summary untuk {asset.ticker} belum memiliki catatan detail.
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="disc">
                Analisis teknikal ini ditarik dari endpoint candles dan technical-summary. Bukan
                merupakan sinyal trading; gunakan bersama konteks fundamental dan risk management
                yang memadai.
            </div>

            {/* ── Fullscreen modal (separate component) ──────────────────────── */}
            <ChartExpandModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                candles={candles}
                ticker={asset.ticker}
                interval={CANDLES_INTERVAL}
                accent={accent}
                initialIndicators={activeIndicators}
            />
        </section>
    );
}