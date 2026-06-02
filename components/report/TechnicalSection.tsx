"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ColorType,
    createChart,
    CandlestickSeries,
    type CandlestickData,
    type IChartApi,
    type ISeriesApi,
    type UTCTimestamp,
} from "lightweight-charts";
import { API_BASE_URL } from "@/lib/env";
import { COLOR_MAP } from "@/lib/research-utils";
import { ResearchAsset } from "@/lib/types";

type CandlePoint = {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
};

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

const SUMMARY_RANGE = "2y";
const SUMMARY_INTERVAL = "1mo";
const CANDLES_INTERVAL = "1d";
const CANDLES_LIMIT = 365;
const LEFT_EDGE_THRESHOLD = 24;
const INITIAL_VISIBLE_POINTS = 120;

type VisibleRange = { from: number; to: number };

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

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

function formatChartPrice(value: number) {
    return new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: 0,
    }).format(value);
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

export function TechnicalSection({ asset }: { asset: ResearchAsset }) {
    const accent = COLOR_MAP[asset.color] ?? "#5FB88A";
    const [candles, setCandles] = useState<CandlePoint[]>([]);
    const [summary, setSummary] = useState<TechnicalSummaryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const chartContainerRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const candlesRef = useRef<CandlePoint[]>([]);
    const hasMoreRef = useRef(false);
    const loadingMoreRef = useRef(false);
    const initialVisibleRangeAppliedRef = useRef(false);
    const pendingVisibleRangeRef = useRef<VisibleRange | null>(null);
    const pendingShiftRef = useRef(0);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        candlesRef.current = candles;
    }, [candles]);

    useEffect(() => {
        hasMoreRef.current = hasMore;
    }, [hasMore]);

    useEffect(() => {
        loadingMoreRef.current = loadingMore;
    }, [loadingMore]);

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

                if (!candlesResponse.ok) {
                    throw new Error(
                        getApiErrorMessage("Gagal memuat candle series", candlesResponse.status),
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

                const candlesData = (await candlesResponse.json()) as CandlesResponse;
                const summaryData = (await summaryResponse.json()) as TechnicalSummaryResponse;

                const nextCandles = [...(candlesData.candles ?? [])].sort(
                    (left, right) => left.time - right.time,
                );

                setCandles(nextCandles);
                setHasMore(Boolean(candlesData.hasMore));
                setSummary(summaryData);
            } catch (fetchError) {
                if (controller.signal.aborted) return;

                setCandles([]);
                setSummary(null);
                setHasMore(false);
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

    const loadOlderCandles = useCallback(async () => {
        if (loadingMoreRef.current || !hasMoreRef.current || !candlesRef.current.length) {
            return;
        }

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

            if (!response.ok) {
                throw new Error(
                    getApiErrorMessage("Gagal memuat candle historis", response.status),
                );
            }

            const responseData = (await response.json()) as CandlesResponse;
            const olderCandles = [...(responseData.candles ?? [])].sort(
                (left, right) => left.time - right.time,
            );

            if (!mountedRef.current) {
                return;
            }

            if (!olderCandles.length) {
                setHasMore(Boolean(responseData.hasMore));
                return;
            }

            const mergedCandles = mergeCandles(candlesRef.current, olderCandles);
            pendingShiftRef.current = mergedCandles.length - candlesRef.current.length;
            setCandles(mergedCandles);
            setHasMore(Boolean(responseData.hasMore));
        } catch (fetchError) {
            if (!mountedRef.current) {
                return;
            }

            if (fetchError instanceof Error) {
                setError(fetchError.message);
            }
        } finally {
            loadingMoreRef.current = false;
            if (mountedRef.current) {
                setLoadingMore(false);
            }
        }
    }, [asset.ticker]);

    useEffect(() => {
        if (!chartContainerRef.current || chartRef.current) {
            return;
        }

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
            rightPriceScale: {
                borderColor: "rgba(255, 255, 255, 0.08)",
            },
            timeScale: {
                borderColor: "rgba(255, 255, 255, 0.08)",
                timeVisible: true,
                secondsVisible: false,
                rightOffset: 8,
                barSpacing: 8,
                fixLeftEdge: true,
            },
            crosshair: {
                vertLine: { color: "rgba(255, 255, 255, 0.24)", width: 1 },
                horzLine: { color: "rgba(255, 255, 255, 0.24)", width: 1 },
            },
            localization: {
                priceFormatter: formatChartPrice,
            },
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

        const resizeObserver = new ResizeObserver(() => {
            if (!chartContainerRef.current) {
                return;
            }

            chart.resize(
                Math.max(1, Math.floor(chartContainerRef.current.clientWidth)),
                Math.max(1, Math.floor(chartContainerRef.current.clientHeight)),
                true,
            );
        });

        resizeObserver.observe(chartContainerRef.current);

        const handleVisibleRangeChange = (range: VisibleRange | null) => {
            if (
                !range ||
                loadingMoreRef.current ||
                !hasMoreRef.current ||
                range.from > LEFT_EDGE_THRESHOLD
            ) {
                return;
            }

            void loadOlderCandles();
        };

        chart.timeScale().subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);

        if (candlesRef.current.length > 0) {
            candlestickSeries.setData(toChartCandles(candlesRef.current));
            const start = Math.max(0, candlesRef.current.length - INITIAL_VISIBLE_POINTS);
            chart.timeScale().setVisibleLogicalRange({
                from: start,
                to: candlesRef.current.length + 8,
            });
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

    useEffect(() => {
        if (!chartRef.current || !candleSeriesRef.current || !candles.length) {
            return;
        }

        candleSeriesRef.current.setData(toChartCandles(candles));

        if (!initialVisibleRangeAppliedRef.current) {
            const start = Math.max(0, candles.length - INITIAL_VISIBLE_POINTS);
            chartRef.current.timeScale().setVisibleLogicalRange({
                from: start,
                to: candles.length + 8,
            });
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
        ? new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(new Date(summaryMeta.period.to))
        : null;
    const latestClose = snapshot?.close ?? latestPoint?.close;
    const latestVolume = wyckoffIndicators?.latestVolume ?? snapshot?.volume ?? latestPoint?.volume;
    const avgVolume = useMemo(() => {
        if (wyckoffIndicators?.avgVolume30) {
            return wyckoffIndicators.avgVolume30;
        }

        const recentCandles = candles.slice(-30);

        if (!recentCandles.length) {
            return null;
        }

        return recentCandles.reduce((sum, candle) => sum + candle.volume, 0) / recentCandles.length;
    }, [candles, wyckoffIndicators?.avgVolume30]);
    const chartDateLabel = summary?.wyckoffIndicators?.asOf ?? snapshot?.date ?? latestPoint?.time;
    const signal = summary?.overview?.signal ?? "-";
    const phase = wyckoff?.phase ?? "-";
    const confidence =
        typeof wyckoff?.confidence === "number"
            ? `${Math.round(wyckoff.confidence * 100)}%`
            : "-";
    const notes = wyckoff?.notes ?? [];
    const rsiValue = Number.parseFloat(wyckoffIndicators?.rsi14 ?? indicators?.rsi14 ?? "");
    const rsiTone = Number.isNaN(rsiValue)
        ? "var(--muted2)"
        : rsiValue > 70
            ? "var(--red)"
            : rsiValue < 35
                ? "var(--green)"
                : "var(--amber)";

    if (loading && !summary) {
        return (
            <div className="placeholder" >
                <h3>Memuat analisis teknikal </h3>
                < p > Data candle dan Wyckoff untuk {asset.ticker} sedang diambil dari API.</p>
            </div>
        );
    }

    if (error || !summary || !candles.length) {
        return (
            <div className="placeholder" >
                <h3>Data teknikal belum tersedia </h3>
                < p > {error || `Analisis teknikal untuk ${asset.ticker} sedang disiapkan.`
                } </p>
            </div>
        );
    }

    return (
        <section className="tek-wrap" >
            <div className="tek-wyckoff" >
                <div className="tek-wyckoff-title" > Analisis Wyckoff — {companyName} </div>
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
                            {formatNumber(wyckoffIndicators?.rsi14 ?? indicators?.rsi14)}
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
                        < div className="tek-ind-val" style={{ fontSize: "12px" }}>
                            {formatCurrency(wyckoffIndicators?.ma50 ?? indicators?.ma50)}
                        </div>
                        < div className="tek-ind-sig" style={{ color: "var(--muted2)" }}>
                            Moving Average
                        </div>
                    </div>
                    < div className="tek-ind" >
                        <div className="tek-ind-lbl" > MA 200 harian </div>
                        < div className="tek-ind-val" style={{ fontSize: "12px" }}>
                            {formatCurrency(wyckoffIndicators?.ma200 ?? indicators?.ma200)}
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
                        < div className="tek-ind-sig" style={{ color: "var(--grove)" }}>
                            {loadingMore ? "Memuat data historis lebih lama..." : "Avg 30 hari"}
                        </div>
                    </div>
                </div>

                < div className="tek-chart-wrap" >
                    <div className="tek-chart-ttl" >
                        Candlestick chart {asset.ticker} · {CANDLES_INTERVAL} · data awal {candles.length}
                    </div>
                    < div className="mt-1 text-[10px] text-grove-muted2" >
                        Scroll ke kiri untuk memuat histori candle yang lebih lama.
                    </div>
                    <div
                        ref={chartContainerRef}
                        role="img"
                        aria-label={`Candlestick chart for ${asset.ticker}`}
                        className="mt-3 w-full"
                        style={{ height: "260px" }}
                    />
                </div>

                < div className="tek-analysis-rows" >
                    {
                        notes.length ? (
                            notes.map((item) => (
                                <div key={item} className="tek-row" >
                                    <div className="tek-row-ico" style={{ background: "var(--grove)" }} />
                                    <div className="tek-row-txt" dangerouslySetInnerHTML={{ __html: item }} />
                                </div>
                            ))
                        ) : (
                            <div className="tek-row" >
                                <div className="tek-row-ico" style={{ background: "var(--grove)" }} />
                                < div className="tek-row-txt" >
                                    Wyckoff summary untuk {asset.ticker} belum memiliki catatan detail.
                                </div>
                            </div>
                        )}
                </div>
            </div>

            < div className="disc" >
                Analisis teknikal ini ditarik dari endpoint candles dan technical - summary.Bukan
                merupakan sinyal trading; gunakan bersama konteks fundamental dan risk
                management yang memadai.
            </div>
        </section>
    );
}
