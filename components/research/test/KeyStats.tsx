'use client';

import { useCallback, useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/env';
import { formatAbbreviated } from '@/lib/formatter';

type MetricType = 'netIncome' | 'eps' | 'revenue';

interface ApiKeyStatsRecord {
    period: string;
    fiscalYear: number;
    netIncome: string;
    eps: string;
    revenue: string;
}

interface KeyStatsRow {
    period: string;
    values: Record<string, number | string | null>;
}

interface KeyStatsTableProps {
    /** Stock ticker, e.g. "BBCA" */
    symbol: string;
}

const METRICS: { key: MetricType; label: string }[] = [
    { key: 'netIncome', label: 'Net Income' },
    { key: 'eps', label: 'EPS' },
    { key: 'revenue', label: 'Revenue' },
];

const PLACEHOLDER_ROWS: KeyStatsRow[] = [
    { period: 'Q1', values: {} },
    { period: 'Q2', values: {} },
    { period: 'Q3', values: {} },
    { period: 'Q4', values: {} },
];

const CURRENT_YEAR = new Date().getFullYear();

function formatValue(value: number | string | null | undefined, metric: MetricType): string {
    if (value === null || value === undefined || value === '') return '–';

    const stringValue = typeof value === 'string' ? value : String(value);
    return formatAbbreviated(stringValue);
}

export default function KeyStatsTable({
    symbol,
}: KeyStatsTableProps) {
    const [metric, setMetric] = useState<MetricType>('netIncome');
    const [years, setYears] = useState<number[]>([]);
    const [rows, setRows] = useState<KeyStatsRow[]>(PLACEHOLDER_ROWS);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(
                `${API_BASE_URL}/stocks/${symbol.toLocaleLowerCase()}/key-statistics`
            );
            if (!res.ok) throw new Error(`Request gagal (${res.status})`);

            const data: ApiKeyStatsRecord[] = await res.json();

            // Group by fiscal year
            const yearMap = new Map<number, Map<string, ApiKeyStatsRecord>>();
            data.forEach((record) => {
                if (!yearMap.has(record.fiscalYear)) {
                    yearMap.set(record.fiscalYear, new Map());
                }
                yearMap.get(record.fiscalYear)!.set(record.period, record);
            });

            // Sort years from newest to oldest
            const sortedYears = Array.from(yearMap.keys()).sort((a, b) => b - a);
            setYears(sortedYears);

            // Build rows for Q1-Q4
            const periods = ['Q1', 'Q2', 'Q3', 'Q4'];
            const newRows: KeyStatsRow[] = periods.map((period) => ({
                period,
                values: {},
            }));

            sortedYears.forEach((year) => {
                const yearData = yearMap.get(year)!;
                periods.forEach((period, idx) => {
                    const record = yearData.get(period);
                    if (record) {
                        const value = (record as any)[metric];
                        newRows[idx].values[String(year)] = value;
                    } else {
                        newRows[idx].values[String(year)] = null;
                    }
                });
            });

            setRows(newRows);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal memuat data');
            setRows(PLACEHOLDER_ROWS);
        } finally {
            setLoading(false);
        }
    }, [symbol, metric]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    return (
        <div className="w-full max-w-2xl rounded-2xl border border-emerald-900/40 bg-[#0b1210] p-5 shadow-[0_0_50px_-20px_rgba(16,185,129,0.35)] sm:p-6">
            {/* Tabs */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1 rounded-full border border-white/5 bg-black/30 p-1">
                    {METRICS.map(({ key, label }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setMetric(key)}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-medium tracking-wide transition-colors duration-150 sm:text-sm ${metric === key
                                ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/40'
                                : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <div className="min-w-[480px]">
                    {/* Header row */}
                    <div
                        className="grid items-center gap-2 border-b border-emerald-900/30 pb-3"
                        style={{ gridTemplateColumns: `140px repeat(${years.length}, minmax(72px, 1fr))` }}
                    >
                        <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Period</span>
                        {years.map((year) => (
                            <span
                                key={year}
                                className="justify-self-end rounded-md px-2 py-1 font-mono text-sm font-semibold tabular-nums text-gray-300"
                            >
                                {year}
                            </span>
                        ))}
                    </div>

                    {/* Data rows */}
                    <div className={`relative transition-opacity duration-150 ${loading ? 'opacity-40' : 'opacity-100'}`}>
                        {rows.map((row, idx) => (
                            <div
                                key={`${row.period}-${idx}`}
                                className="grid items-center gap-2 py-2.5"
                                style={{ gridTemplateColumns: `140px repeat(${years.length}, minmax(72px, 1fr))` }}
                            >
                                <span className="text-sm font-medium text-gray-400">{row.period}</span>
                                {years.map((year) => (
                                    <span
                                        key={year}
                                        className="justify-self-end font-mono text-sm tabular-nums text-gray-300"
                                    >
                                        {formatValue(row.values[String(year)], metric)}
                                    </span>
                                ))}
                            </div>
                        ))}

                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="rounded-full border border-emerald-500/30 bg-black/60 px-3 py-1 text-xs text-emerald-300">
                                    Memuat…
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3 text-xs text-gray-500">
                <span>{symbol}</span>
                {error && <span className="text-rose-400">{error}</span>}
            </div>
        </div>
    );
}