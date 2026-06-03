"use client";

import { useEffect, useRef, useState } from "react";
import {
    ColorType,
    CrosshairMode,
    createChart,
    CandlestickSeries,
    LineSeries,
    HistogramSeries,
    type IChartApi,
    type ISeriesApi,
    type UTCTimestamp,
} from "lightweight-charts";
import { X, BarChart2, ChevronDown, Check } from "lucide-react";

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatChartPrice(value: number) {
    return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value);
}

function formatVolume(value: number) {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return String(value);
}

function formatDateLabel(ts: number) {
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(ts * 1000));
}

function toChartCandles(candles: CandlePoint[]) {
    return candles.map((c) => ({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
    }));
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

const INITIAL_VISIBLE_POINTS = 120;

// ─── OHLCV Tooltip ────────────────────────────────────────────────────────────

function OHLCVTooltip({
    data,
    accent,
    compact = false,
}: {
    data: HoveredOHLCV;
    accent: string;
    compact?: boolean;
}) {
    if (!data) return null;

    const isUp = data.close >= data.open;
    const changeAbs = data.close - data.open;
    const changePct = ((changeAbs / data.open) * 100).toFixed(2);
    const changeColor = isUp ? accent : "#e04848";

    return (
        <div
            style={{
                position: "absolute",
                top: compact ? 8 : 12,
                left: compact ? 8 : 12,
                zIndex: 20,
                background: "rgba(18, 25, 26, 0.92)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 8,
                padding: compact ? "6px 10px" : "8px 12px",
                backdropFilter: "blur(8px)",
                pointerEvents: "none",
                minWidth: compact ? 140 : 160,
            }}
        >
            <div
                style={{
                    fontSize: compact ? 9 : 10,
                    color: "rgba(255,255,255,0.40)",
                    marginBottom: 4,
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
                    gap: compact ? "2px 12px" : "3px 14px",
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
                            gap: 4,
                            fontFamily: "Inter, sans-serif",
                        }}
                    >
                        <span
                            style={{
                                fontSize: compact ? 9 : 10,
                                color: "rgba(255,255,255,0.35)",
                                fontWeight: 600,
                                minWidth: 10,
                            }}
                        >
                            {label}
                        </span>
                        <span
                            style={{
                                fontSize: compact ? 10 : 11,
                                color:
                                    label === "C"
                                        ? changeColor
                                        : "rgba(255,255,255,0.80)",
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
                    marginTop: compact ? 4 : 5,
                    paddingTop: compact ? 4 : 5,
                    borderTop: "1px solid rgba(255,255,255,0.07)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    fontFamily: "Inter, sans-serif",
                }}
            >
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span
                        style={{
                            fontSize: compact ? 9 : 10,
                            color: "rgba(255,255,255,0.35)",
                            fontWeight: 600,
                        }}
                    >
                        VOL
                    </span>
                    <span
                        style={{
                            fontSize: compact ? 10 : 11,
                            color: "rgba(255,255,255,0.70)",
                        }}
                    >
                        {formatVolume(data.volume)}
                    </span>
                </div>
                <span
                    style={{
                        fontSize: compact ? 9 : 10,
                        color: changeColor,
                        fontWeight: 600,
                    }}
                >
                    {isUp ? "+" : ""}
                    {changePct}%
                </span>
            </div>
        </div>
    );
}

// ─── Main Modal Component ─────────────────────────────────────────────────────

export interface ChartExpandModalProps {
    isOpen: boolean;
    onClose: () => void;
    candles: CandlePoint[];
    ticker: string;
    interval: string;
    accent: string;
    /** Sync the active indicators from the parent (optional) */
    initialIndicators?: Set<IndicatorKey>;
}

export function ChartExpandModal({
    isOpen,
    onClose,
    candles,
    ticker,
    interval,
    accent,
    initialIndicators,
}: ChartExpandModalProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const ma50Ref = useRef<ISeriesApi<"Line"> | null>(null);
    const ma200Ref = useRef<ISeriesApi<"Line"> | null>(null);
    const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);
    const indicatorMenuRef = useRef<HTMLDivElement | null>(null);

    const [activeIndicators, setActiveIndicators] = useState<Set<IndicatorKey>>(
        initialIndicators ?? new Set(),
    );
    const [showIndicatorMenu, setShowIndicatorMenu] = useState(false);
    const [hoveredOHLCV, setHoveredOHLCV] = useState<HoveredOHLCV>(null);

    // Close indicator menu on outside click
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (indicatorMenuRef.current && !indicatorMenuRef.current.contains(e.target as Node)) {
                setShowIndicatorMenu(false);
            }
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // ESC to close modal
    useEffect(() => {
        function handler(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        if (isOpen) document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    // Build chart when modal opens
    useEffect(() => {
        if (!isOpen || !containerRef.current || chartRef.current) return;

        const chart = createChart(containerRef.current, {
            autoSize: true,
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

        const series = chart.addSeries(CandlestickSeries, {
            upColor: accent,
            downColor: "#e04848",
            borderUpColor: accent,
            borderDownColor: "#e04848",
            wickUpColor: accent,
            wickDownColor: "#e04848",
        });

        if (candles.length > 0) {
            series.setData(toChartCandles(candles));
            const start = Math.max(0, candles.length - INITIAL_VISIBLE_POINTS);
            chart.timeScale().setVisibleLogicalRange({ from: start, to: candles.length + 8 });
        }

        // Subscribe to crosshair move for OHLCV tooltip
        chart.subscribeCrosshairMove((param) => {
            if (!param || !param.time || !param.seriesData) {
                setHoveredOHLCV(null);
                return;
            }
            const barData = param.seriesData.get(series) as
                | { open: number; high: number; low: number; close: number }
                | undefined;
            if (!barData) {
                setHoveredOHLCV(null);
                return;
            }
            const ts = param.time as number;
            const found = candles.find((c) => c.time === ts);
            setHoveredOHLCV({
                open: barData.open,
                high: barData.high,
                low: barData.low,
                close: barData.close,
                volume: found?.volume ?? 0,
                time: ts,
            });
        });

        chartRef.current = chart;
        candleSeriesRef.current = series;

        return () => {
            chart.remove();
            chartRef.current = null;
            candleSeriesRef.current = null;
            ma50Ref.current = null;
            ma200Ref.current = null;
            volumeRef.current = null;
            setHoveredOHLCV(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Sync candles into already-mounted chart
    useEffect(() => {
        if (!candleSeriesRef.current || !candles.length) return;
        candleSeriesRef.current.setData(toChartCandles(candles));
    }, [candles]);

    // Manage indicator series
    useEffect(() => {
        const chart = chartRef.current;
        if (!chart || !candles.length) return;

        if (activeIndicators.has("ma50")) {
            if (!ma50Ref.current) {
                const s = chart.addSeries(LineSeries, {
                    color: "#f5c842",
                    lineWidth: 1,
                    priceLineVisible: false,
                    lastValueVisible: false,
                    crosshairMarkerVisible: false,
                });
                s.setData(computeMA(candles, 50));
                ma50Ref.current = s;
            }
        } else {
            if (ma50Ref.current) { chart.removeSeries(ma50Ref.current); ma50Ref.current = null; }
        }

        if (activeIndicators.has("ma200")) {
            if (!ma200Ref.current) {
                const s = chart.addSeries(LineSeries, {
                    color: "#e06de0",
                    lineWidth: 1,
                    priceLineVisible: false,
                    lastValueVisible: false,
                    crosshairMarkerVisible: false,
                });
                s.setData(computeMA(candles, 200));
                ma200Ref.current = s;
            }
        } else {
            if (ma200Ref.current) { chart.removeSeries(ma200Ref.current); ma200Ref.current = null; }
        }

        if (activeIndicators.has("volume")) {
            if (!volumeRef.current) {
                const s = chart.addSeries(HistogramSeries, {
                    priceFormat: { type: "volume" },
                    priceScaleId: "volume",
                    priceLineVisible: false,
                    lastValueVisible: false,
                });
                s.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
                s.setData(toVolumeData(candles, accent));
                volumeRef.current = s;
            }
        } else {
            if (volumeRef.current) { chart.removeSeries(volumeRef.current); volumeRef.current = null; }
        }
    }, [activeIndicators, candles, accent]);

    const toggleIndicator = (key: IndicatorKey) => {
        setActiveIndicators((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    if (!isOpen) return null;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[1200px] rounded-xl border border-white/10 bg-[#12191a] overflow-hidden flex flex-col shadow-2xl"
                style={{ maxHeight: "90vh" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/8 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[13px] font-semibold text-white/80 truncate">
                            Candlestick chart {ticker} · {interval}
                        </span>
                        <span className="text-[11px] text-white/40 shrink-0">
                            {candles.length} candle
                        </span>
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

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="flex items-center justify-center w-7 h-7 rounded-md cursor-pointer transition-colors bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/60 hover:text-white/90"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>

                {/* Chart area with OHLCV overlay */}
                <div className="relative flex-1" style={{ minHeight: 480 }}>
                    <OHLCVTooltip data={hoveredOHLCV} accent={accent} />
                    <div ref={containerRef} className="w-full h-full" style={{ minHeight: 480 }} />
                </div>

                {/* Legend row */}
                {activeIndicators.size > 0 && (
                    <div className="flex items-center gap-4 px-5 py-2.5 border-t border-white/8 shrink-0">
                        {activeIndicators.has("ma50") && (
                            <div className="flex items-center gap-1.5">
                                <span className="inline-block w-5 h-0.5 rounded" style={{ background: "#f5c842" }} />
                                <span className="text-[10px] text-white/50">MA 50</span>
                            </div>
                        )}
                        {activeIndicators.has("ma200") && (
                            <div className="flex items-center gap-1.5">
                                <span className="inline-block w-5 h-0.5 rounded" style={{ background: "#e06de0" }} />
                                <span className="text-[10px] text-white/50">MA 200</span>
                            </div>
                        )}
                        {activeIndicators.has("volume") && (
                            <div className="flex items-center gap-1.5">
                                <span className="inline-block w-3 h-3 rounded-sm opacity-60" style={{ background: accent }} />
                                <span className="text-[10px] text-white/50">Volume</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}