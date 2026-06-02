"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    AlertTriangle,
    FileText,
    GripVertical,
    Loader2,
    Search,
    Upload,
    X,
    CheckCircle2,
    Clock3,
    Sparkles,
    Trash2,
    Eye,
    ArrowUpRight,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/env";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Tab } from "@/components/ui/Tab";

const reportTypes = ["Public Expose", "Paparan Publik", "Annual Report"] as const;
const allowedExtensions = ["pdf", "xlsx"] as const;
const yearOptions = Array.from({ length: 12 }, (_, index) => String(new Date().getFullYear() + 1 - index));

type ReportType = (typeof reportTypes)[number];
type UploadStatus = "Pending" | "Processing" | "Done" | "Failed";

type StockSuggestion = {
    ticker: string;
    name: string;
    sector?: string;
    exchange?: string;
    logoUrl?: string | null;
    marketCap?: string | null;
};

type UploadRecord = {
    id: string;
    file: File;
    ticker?: string;
    issuerName?: string;
    year: string;
    reportType: ReportType;
    status: UploadStatus;
    progress: number;
    uploadDate?: string;
};

type HistoryRow = {
    id: string;
    ticker: string;
    issuerName: string;
    year: string;
    reportType: ReportType;
    uploadDate: string;
    status: "Processing" | "Done" | "Failed";
    confidence: number;
    segments: Array<{
        name: string;
        revenue: string;
        growth: string;
        contribution: string;
    }>;
};

const initialHistory: HistoryRow[] = [
    {
        id: "BBCA-2025-Public Expose",
        ticker: "BBCA",
        issuerName: "Bank Central Asia Tbk",
        year: "2025",
        reportType: "Public Expose",
        uploadDate: "2026-05-28 14:20",
        status: "Done",
        confidence: 92,
        segments: [
            { name: "Consumer Banking", revenue: "Rp 22.4T", growth: "+11.2%", contribution: "41%" },
            { name: "SME Banking", revenue: "Rp 10.8T", growth: "+8.4%", contribution: "20%" },
            { name: "Treasury & Markets", revenue: "Rp 7.1T", growth: "+6.1%", contribution: "13%" },
        ],
    },
    {
        id: "TLKM-2024-Annual Report",
        ticker: "TLKM",
        issuerName: "Telkom Indonesia (Persero) Tbk",
        year: "2024",
        reportType: "Annual Report",
        uploadDate: "2026-05-27 09:15",
        status: "Processing",
        confidence: 74,
        segments: [
            { name: "Mobile Consumer", revenue: "Rp 31.9T", growth: "+4.8%", contribution: "55%" },
            { name: "Enterprise", revenue: "Rp 12.6T", growth: "+7.0%", contribution: "22%" },
            { name: "Infra & Wholesale", revenue: "Rp 8.1T", growth: "+6.3%", contribution: "14%" },
        ],
    },
    {
        id: "ASII-2024-Paparan Publik",
        ticker: "ASII",
        issuerName: "Astra International Tbk",
        year: "2024",
        reportType: "Paparan Publik",
        uploadDate: "2026-05-25 16:45",
        status: "Failed",
        confidence: 61,
        segments: [
            { name: "Automotive", revenue: "Rp 108.5T", growth: "+3.1%", contribution: "49%" },
            { name: "Heavy Equipment", revenue: "Rp 39.8T", growth: "-2.2%", contribution: "18%" },
            { name: "Financial Services", revenue: "Rp 33.2T", growth: "+5.7%", contribution: "15%" },
        ],
    },
];

function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
}

function formatDateTime(value: Date) {
    const parts = new Intl.DateTimeFormat("id-ID", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).formatToParts(value);

    const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
    return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
}

function getExtension(fileName: string) {
    return fileName.toLowerCase().split(".").pop() ?? "";
}

function isSupportedFile(file: File) {
    const extension = getExtension(file.name);
    return allowedExtensions.includes(extension as (typeof allowedExtensions)[number]);
}

function inferTickerFromFileName(fileName: string) {
    const cleaned = fileName.replace(/\.[^.]+$/, "");
    const match = cleaned.match(/\b([A-Z]{3,6})\b/);
    return match?.[1] ?? cleaned.slice(0, 4).toUpperCase();
}

function buildSegmentsFromFile(fileName: string) {
    const base = inferTickerFromFileName(fileName);
    return [
        { name: `${base} Core`, revenue: "Rp 18.2T", growth: "+9.4%", contribution: "38%" },
        { name: `${base} Adjacent`, revenue: "Rp 11.6T", growth: "+6.8%", contribution: "24%" },
        { name: `${base} Other`, revenue: "Rp 7.8T", growth: "+4.1%", contribution: "16%" },
    ];
}

function getStatusTone(status: UploadStatus | HistoryRow["status"]) {
    if (status === "Done") return "border-[#22C97A]/35 bg-[#22C97A]/10 text-[#22C97A]";
    if (status === "Processing") return "border-grove-amber/35 bg-grove-amber/10 text-grove-amber";
    return "border-grove-red/35 bg-grove-red/10 text-grove-red";
}

function getIconForStatus(status: UploadStatus) {
    if (status === "Done") return <CheckCircle2 className="h-3.5 w-3.5" />;
    if (status === "Processing") return <Loader2 className="h-3.5 w-3.5 animate-spin" />;
    if (status === "Failed") return <X className="h-3.5 w-3.5" />;
    return <Clock3 className="h-3.5 w-3.5" />;
}

function stockToLabel(stock?: StockSuggestion) {
    if (!stock) return "";
    return `${stock.ticker} · ${stock.name}`;
}

function normalizeStockSuggestion(payload: any, fallbackQuery: string): StockSuggestion | null {
    const listing = payload?.listing ?? payload?.data?.listing ?? payload?.result?.listing;
    const company = payload?.company ?? payload?.data?.company ?? payload?.result?.company;
    const exchange = payload?.exchange ?? payload?.data?.exchange ?? payload?.result?.exchange;
    const sector = payload?.sector ?? payload?.data?.sector ?? payload?.result?.sector;

    const ticker = String(listing?.symbol ?? payload?.symbol ?? fallbackQuery ?? "").trim().toUpperCase();
    if (!ticker) return null;

    return {
        ticker,
        name: String(company?.displayName ?? company?.legalName ?? payload?.name ?? fallbackQuery).trim() || ticker,
        sector: String(sector?.name ?? sector ?? "").trim() || undefined,
        exchange: String(exchange?.code ?? exchange?.name ?? "").trim() || undefined,
        logoUrl: company?.logoUrl ?? null,
        marketCap: payload?.marketCap ?? payload?.data?.marketCap ?? payload?.result?.marketCap ?? null,
    };
}

export function PubexUploadAdmin() {
    const [tab, setTab] = useState<"single" | "bulk">("single");
    const [singleQuery, setSingleQuery] = useState("");
    const [singleYear, setSingleYear] = useState(String(new Date().getFullYear()));
    const [singleReportType, setSingleReportType] = useState<ReportType>("Public Expose");
    const [singleFile, setSingleFile] = useState<File | null>(null);
    const [singleSuggestion, setSingleSuggestion] = useState<StockSuggestion | null>(null);
    const [suggestions, setSuggestions] = useState<StockSuggestion[]>([]);
    const [suggestionLoading, setSuggestionLoading] = useState(false);
    const [suggestionError, setSuggestionError] = useState<string | null>(null);
    const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
    const [bulkFiles, setBulkFiles] = useState<Array<{ id: string; file: File; status: UploadStatus; progress: number }>>([]);
    const [history, setHistory] = useState<HistoryRow[]>(initialHistory);
    const [activeResult, setActiveResult] = useState<HistoryRow | null>(null);
    const [singleDragActive, setSingleDragActive] = useState(false);
    const [bulkDragActive, setBulkDragActive] = useState(false);
    const [singleUploadLoading, setSingleUploadLoading] = useState(false);
    const [bulkUploadLoading, setBulkUploadLoading] = useState(false);
    const singleFileInputRef = useRef<HTMLInputElement | null>(null);
    const bulkFileInputRef = useRef<HTMLInputElement | null>(null);
    const bulkDropRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const query = singleQuery.trim();
        if (query.length < 2) {
            setSuggestions([]);
            setSuggestionError(null);
            setSuggestionLoading(false);
            setIsSuggestionOpen(false);
            return;
        }

        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            setSuggestionLoading(true);
            setSuggestionError(null);

            try {
                const response = await fetch(`${API_BASE_URL}/stocks/${encodeURIComponent(query.toLowerCase())}`, {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`Request failed with ${response.status}`);
                }

                const payload = await response.json();
                const normalized = normalizeStockSuggestion(payload, query);

                setSuggestions(normalized ? [normalized] : []);
                setIsSuggestionOpen(Boolean(normalized));
            } catch (error) {
                if (controller.signal.aborted) return;
                setSuggestions([]);
                setIsSuggestionOpen(true);
                setSuggestionError("Autocomplete emiten tidak tersedia saat ini.");
            } finally {
                if (!controller.signal.aborted) {
                    setSuggestionLoading(false);
                }
            }
        }, 350);

        return () => {
            controller.abort();
            window.clearTimeout(timer);
        };
    }, [singleQuery]);

    function queueBulkFiles(fileList: FileList | null) {
        if (!fileList?.length) return;

        const incoming = Array.from(fileList).filter(isSupportedFile);
        const mapped = incoming.map((file) => ({
            id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
            file,
            status: "Pending" as UploadStatus,
            progress: 0,
        }));

        setBulkFiles((current) => [...current, ...mapped]);
    }

    function handleSingleFileChange(fileList: FileList | null) {
        const file = fileList?.[0];
        if (!file || !isSupportedFile(file)) return;
        setSingleFile(file);
    }

    function handleSingleDragOver(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setSingleDragActive(true);
    }

    function handleSingleDragLeave() {
        setSingleDragActive(false);
    }

    function handleSingleUpload() {
        if (!singleFile || !singleQuery.trim() || singleUploadLoading) return;

        const requestStock = singleSuggestion ?? {
            ticker: singleQuery.trim().toUpperCase(),
            name: singleQuery.trim(),
        };

        const requestHistoryId = `${requestStock.ticker}-${singleYear}-${singleReportType}-${crypto.randomUUID()}`;
        const optimisticRow: HistoryRow = {
            id: requestHistoryId,
            ticker: requestStock.ticker,
            issuerName: requestStock.name,
            year: singleYear,
            reportType: singleReportType,
            uploadDate: formatDateTime(new Date()),
            status: "Processing",
            confidence: 0,
            segments: buildSegmentsFromFile(singleFile.name),
        };

        setSingleUploadLoading(true);
        setHistory((current) => [optimisticRow, ...current]);

        const formData = new FormData();
        formData.append("file", singleFile);
        formData.append("ticker", requestStock.ticker);
        formData.append("issuerName", requestStock.name);
        formData.append("year", singleYear);
        formData.append("reportType", singleReportType);

        fetch(`${API_BASE_URL}/pubex/upload/single`, {
            method: "POST",
            body: formData,
        })
            .then(async (response) => {
                const payload = await response.json().catch(() => null);
                if (!response.ok) {
                    throw new Error(payload?.message ?? `Upload single failed with ${response.status}`);
                }

                const responseTicker = String(payload?.ticker ?? payload?.data?.ticker ?? requestStock.ticker).toUpperCase();
                const responseIssuer = String(
                    payload?.issuerName ?? payload?.data?.issuerName ?? requestStock.name,
                );
                const responseConfidence = Number(payload?.confidence ?? payload?.data?.confidence ?? 92);
                const responseYear = String(payload?.year ?? payload?.data?.year ?? singleYear);
                const responseReportType = (payload?.reportType ?? payload?.data?.reportType ?? singleReportType) as ReportType;

                setHistory((current) =>
                    current.map((entry) =>
                        entry.id === requestHistoryId
                            ? {
                                ...entry,
                                ticker: responseTicker,
                                issuerName: responseIssuer,
                                year: responseYear,
                                reportType: responseReportType,
                                status: "Done",
                                confidence: Number.isFinite(responseConfidence) ? responseConfidence : 92,
                            }
                            : entry,
                    ),
                );

                setSingleFile(null);
                setSingleQuery("");
                setSingleSuggestion(null);
                setSuggestions([]);
                setIsSuggestionOpen(false);
                setTab("bulk");
            })
            .catch(() => {
                setHistory((current) =>
                    current.map((entry) =>
                        entry.id === requestHistoryId
                            ? {
                                ...entry,
                                status: "Failed",
                                confidence: 58,
                            }
                            : entry,
                    ),
                );
            })
            .finally(() => {
                setSingleUploadLoading(false);
            });
    }

    function handleBulkUploadAll() {
        if (!bulkFiles.length || bulkUploadLoading) return;

        const uploadPlan = bulkFiles.map((item) => ({
            ...item,
            status: "Processing" as UploadStatus,
            progress: 18,
        }));

        setBulkFiles(uploadPlan);
        setBulkUploadLoading(true);

        const formData = new FormData();
        uploadPlan.forEach((item) => {
            formData.append("files", item.file);
        });

        fetch(`${API_BASE_URL}/pubex/upload/bulk`, {
            method: "POST",
            body: formData,
        })
            .then(async (response) => {
                const payload = await response.json().catch(() => null);
                if (!response.ok) {
                    throw new Error(payload?.message ?? `Bulk upload failed with ${response.status}`);
                }

                const responseItems = Array.isArray(payload?.items)
                    ? payload.items
                    : Array.isArray(payload?.data)
                        ? payload.data
                        : Array.isArray(payload)
                            ? payload
                            : [];

                setBulkFiles((current) =>
                    current.map((entry) => ({
                        ...entry,
                        status: "Done",
                        progress: 100,
                    })),
                );

                setHistory((current) => {
                    const nextHistory = [...current];

                    uploadPlan.forEach((item, index) => {
                        const fileTicker = inferTickerFromFileName(item.file.name);
                        const responseItem = responseItems[index] ?? responseItems[0] ?? {};
                        const reportType = (responseItem.reportType ?? (item.file.name.toLowerCase().includes("annual") ? "Annual Report" : "Public Expose")) as ReportType;
                        const responseTicker = String(responseItem.ticker ?? responseItem.symbol ?? fileTicker).toUpperCase();
                        const responseIssuer = String(responseItem.issuerName ?? responseItem.companyName ?? `${responseTicker} Tbk`);
                        const responseYear = String(responseItem.year ?? new Date().getFullYear());
                        const responseConfidence = Number(responseItem.confidence ?? 87);
                        const responseStatus = String(responseItem.status ?? "Done").toLowerCase() === "failed" ? "Failed" : "Done";

                        nextHistory.unshift({
                            id: `${responseTicker}-${Date.now()}-${index}`,
                            ticker: responseTicker,
                            issuerName: responseIssuer,
                            year: responseYear,
                            reportType,
                            uploadDate: formatDateTime(new Date()),
                            status: responseStatus,
                            confidence: Number.isFinite(responseConfidence) ? responseConfidence : responseStatus === "Done" ? 87 : 58,
                            segments: buildSegmentsFromFile(item.file.name),
                        });
                    });

                    return nextHistory;
                });
            })
            .catch(() => {
                setBulkFiles((current) =>
                    current.map((entry) => ({
                        ...entry,
                        status: "Failed",
                        progress: 100,
                    })),
                );

                setHistory((current) =>
                    uploadPlan.reduce<HistoryRow[]>((acc, item) => {
                        const fileTicker = inferTickerFromFileName(item.file.name);
                        acc.unshift({
                            id: `${fileTicker}-${Date.now()}-${crypto.randomUUID()}`,
                            ticker: fileTicker,
                            issuerName: `${fileTicker} Tbk`,
                            year: String(new Date().getFullYear()),
                            reportType: item.file.name.toLowerCase().includes("annual") ? "Annual Report" : "Public Expose",
                            uploadDate: formatDateTime(new Date()),
                            status: "Failed",
                            confidence: 58,
                            segments: buildSegmentsFromFile(item.file.name),
                        });
                        return acc;
                    }, [...current]),
                );
            })
            .finally(() => {
                setBulkUploadLoading(false);
            });
    }

    function clearBulkFiles() {
        setBulkFiles([]);
    }

    function removeBulkFile(id: string) {
        setBulkFiles((current) => current.filter((item) => item.id !== id));
    }

    function handleBulkDragOver(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setBulkDragActive(true);
    }

    function handleBulkDragLeave() {
        setBulkDragActive(false);
    }

    function onSingleDrop(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setSingleDragActive(false);
        handleSingleFileChange(event.dataTransfer.files);
    }

    function onBulkDrop(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setBulkDragActive(false);
        queueBulkFiles(event.dataTransfer.files);
    }

    const selectedFileName = singleFile?.name ?? "Belum ada file dipilih";
    const lowConfidence = activeResult ? activeResult.confidence < 80 : false;
    const uploadCounter = useMemo(() => history.filter((row) => row.status === "Done").length, [history]);

    function reopenUploadForResult(result: HistoryRow) {
        setTab("single");
        setSingleQuery(result.ticker);
        setSingleSuggestion({ ticker: result.ticker, name: result.issuerName });
        setSingleYear(result.year);
        setSingleReportType(result.reportType);
        setActiveResult(null);
    }

    return (
        <main className="container-shell animate-fadeUp py-6 md:py-8" >
            <section className="relative overflow-hidden rounded-[24px] border border-grove-border bg-[linear-gradient(135deg,rgba(18,25,26,0.96),rgba(10,14,11,0.92))] p-5 md:p-7" >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(95,184,138,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(58,158,232,0.10),transparent_28%)]" />
                <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between" >
                    <div className="max-w-full" >
                        <div className="kicker mb-2 flex items-center gap-2" >
                            <Sparkles className="h-3.5 w-3.5" />
                            Admin Upload
                        </div>
                        < h1 className="max-w-2xl font-serif text-[30px] leading-[1.06] text-grove-text md:text-[40px] xl:text-[42px]" >
                            Upload laporan PubEx emiten dengan alur yang rapi dan siap parsing.
                        </h1>
                        < p className="mt-3 max-w-2xl text-[12px] leading-6 text-grove-muted2 md:text-[13px]" >
                            Gunakan single upload untuk satu emiten, atau bulk upload untuk batch PDF / XLSX.Semua hasil upload masuk ke
                            history di bawah untuk tracking status pemrosesan dan review hasil.
                        </p>
                    </div>
                </div>
            </section>

            < section className="mt-5 rounded-[24px] border border-grove-border bg-grove-bg2 p-3 md:p-4" >
                <div className="flex gap-2 overflow-x-auto" >
                    <Tab active={tab === "single"} onClick={() => setTab("single")
                    }> Single Upload </Tab>
                    < Tab active={tab === "bulk"} onClick={() => setTab("bulk")}> Bulk Upload </Tab>
                </div>
            </section>

            < section className="mt-5 grid gap-5 lg:grid-cols-[1.08fr_0.92fr]" >
                <div className="panel overflow-hidden" >
                    {tab === "single" ? (
                        <div className="p-5 md:p-6" >
                            <div className="mb-4 flex items-center justify-between gap-4" >
                                <div>
                                    <div className="kicker mb-2" > Single Upload </div>
                                    < h2 className="font-serif text-[24px] text-grove-text" > Upload satu laporan untuk satu emiten </h2>
                                </div>
                                < div className="rounded-full border border-grove-border bg-grove-dim px-3 py-1 text-[10px] text-grove-primary" >
                                    Auto complete emiten dari API
                                </div>
                            </div>

                            < div className="grid gap-4 md:grid-cols-2" >
                                <div className="relative md:col-span-2" >
                                    <label className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-grove-muted2" > Cari emiten </label>
                                    < div className="relative" >
                                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grove-muted" />
                                        <input
                                            value={singleQuery}
                                            onChange={(event) => {
                                                setSingleQuery(event.target.value.toUpperCase());
                                                setSingleSuggestion(null);
                                            }}
                                            onFocus={() => setIsSuggestionOpen(true)}
                                            placeholder="Ketik kode emiten, mis. BBCA"
                                            className="w-full rounded-[14px] border border-grove-border bg-grove-bg3 py-3 pl-10 pr-10 text-[13px] text-grove-text outline-none transition focus:border-grove-primary/35 focus:bg-grove-bg4"
                                        />
                                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-grove-muted2" >
                                            {suggestionLoading ? "Mencari..." : "API"}
                                        </div>
                                    </div>

                                    {
                                        isSuggestionOpen ? (
                                            <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-[16px] border border-grove-border bg-grove-bg2 shadow-[0_20px_80px_rgba(0,0,0,0.42)]" >
                                                {
                                                    suggestionLoading ? (
                                                        <div className="flex items-center gap-2 px-4 py-3 text-[11px] text-grove-muted2" >
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin text-grove-primary" />
                                                            Mengambil data emiten...
                                                        </div>
                                                    ) : suggestionError ? (
                                                        <div className="px-4 py-3 text-[11px] text-grove-muted2" > {suggestionError} </div>
                                                    ) : suggestions.length ? (
                                                        suggestions.map((item) => (
                                                            <button
                                                                key={item.ticker}
                                                                type="button"
                                                                onClick={() => {
                                                                    setSingleSuggestion(item);
                                                                    setSingleQuery(item.ticker);
                                                                    setIsSuggestionOpen(false);
                                                                }}
                                                                className="flex w-full items-start justify-between gap-4 border-b border-grove-border px-4 py-3 text-left transition hover:bg-grove-bg3 last:border-b-0"
                                                            >
                                                                <div>
                                                                    <div className="font-medium text-grove-text" > {item.ticker} </div>
                                                                    < div className="mt-0.5 text-[11px] text-grove-muted2" > {item.name} </div>
                                                                </div>
                                                                < div className="text-right text-[10px] text-grove-muted2" >
                                                                    {item.sector ? <div>{item.sector} </div> : null}
                                                                    {item.exchange ? <div>{item.exchange} </div> : null}
                                                                </div>
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <div className="px-4 py-3 text-[11px] text-grove-muted2" > Tidak ada hasil yang cocok.</div>
                                                    )}
                                            </div>
                                        ) : null}
                                </div>

                                < div >
                                    <label className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-grove-muted2" > Tahun laporan </label>
                                    < select
                                        value={singleYear}
                                        onChange={(event) => setSingleYear(event.target.value)}
                                        className="w-full rounded-[14px] border border-grove-border bg-grove-bg3 px-4 py-3 text-[13px] text-grove-text outline-none transition focus:border-grove-primary/35"
                                    >
                                        {
                                            yearOptions.map((year) => (
                                                <option key={year} value={year} >
                                                    {year}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>

                                < div >
                                    <label className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-grove-muted2" > Jenis laporan </label>
                                    < select
                                        value={singleReportType}
                                        onChange={(event) => setSingleReportType(event.target.value as ReportType)}
                                        className="w-full rounded-[14px] border border-grove-border bg-grove-bg3 px-4 py-3 text-[13px] text-grove-text outline-none transition focus:border-grove-primary/35"
                                    >
                                        {
                                            reportTypes.map((item) => (
                                                <option key={item} value={item} >
                                                    {item}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>

                                < div className="md:col-span-2" >
                                    <label className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-grove-muted2" > File laporan </label>
                                    < div
                                        onDragOver={handleSingleDragOver}
                                        onDragLeave={handleSingleDragLeave}
                                        onDrop={onSingleDrop}
                                        onClick={() => singleFileInputRef.current?.click()}
                                        className={`flex min-h-[132px] cursor-pointer items-center justify-between gap-4 rounded-[18px] border border-dashed px-4 py-5 transition ${singleDragActive ? "border-grove-primary bg-[rgba(95,184,138,0.12)] shadow-[0_0_0_1px_rgba(95,184,138,0.18)]" : "border-grove-border bg-[rgba(95,184,138,0.04)] hover:border-grove-primary/35 hover:bg-[rgba(95,184,138,0.06)]"}`}
                                    >
                                        <div className="flex items-center gap-3" >
                                            <div className="rounded-full border border-grove-border bg-grove-bg3 p-2" >
                                                <Upload className="h-4 w-4 text-grove-primary" />
                                            </div>
                                            < div >
                                                <div className="text-[13px] font-medium text-grove-text" > Tarik file ke sini atau klik untuk pilih file </div>
                                                < div className="mt-1 text-[11px] text-grove-muted2" > PDF dan XLSX didukung </div>
                                            </div>
                                        </div>
                                        < div className="rounded-full border border-grove-border bg-grove-bg2 px-3 py-1 text-[11px] text-grove-muted2" >
                                            <FileText className="h-4 w-4" />
                                            Accept: .pdf, .xlsx
                                        </div>
                                    </div>
                                    < input
                                        ref={singleFileInputRef}
                                        type="file"
                                        accept=".pdf,.xlsx,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                        className="hidden"
                                        onChange={(event) => handleSingleFileChange(event.target.files)}
                                    />
                                </div>
                            </div>

                            < div className="mt-4 rounded-[16px] border border-grove-border bg-grove-bg3 px-4 py-3" >
                                <div className="text-[10px] uppercase tracking-[0.16em] text-grove-muted2" > Preview file </div>
                                < div className="mt-1 flex items-center justify-between gap-3 text-[13px] text-grove-text" >
                                    <span className="truncate" > {selectedFileName} </span>
                                    {singleFile ? <span className="text-grove-muted2" > {formatFileSize(singleFile.size)} </span> : null}
                                </div>
                                {
                                    singleSuggestion ? (
                                        <div className="mt-2 text-[11px] text-grove-muted2" > Terpilih : {stockToLabel(singleSuggestion)} </div>
                                    ) : null
                                }
                            </div>

                            < div className="mt-5 flex flex-wrap items-center gap-3" >
                                <button
                                    type="button"
                                    onClick={handleSingleUpload}
                                    disabled={!singleFile || !singleQuery.trim() || singleUploadLoading}
                                    className="inline-flex items-center gap-2 rounded-full bg-grove-primary px-4 py-2.5 text-[12px] font-medium text-[#09130f] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {singleUploadLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                    {singleUploadLoading ? "Uploading..." : "Upload"}
                                </button>
                                < button
                                    type="button"
                                    onClick={() => {
                                        setSingleFile(null);
                                        setSingleQuery("");
                                        setSingleSuggestion(null);
                                        setSuggestions([]);
                                    }}
                                    className="inline-flex items-center gap-2 rounded-full border border-grove-border bg-transparent px-4 py-2.5 text-[12px] font-medium text-grove-text transition hover:border-grove-primary/30 hover:text-grove-primary"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Reset
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-5 md:p-6" >
                            <div className="mb-4 flex items-center justify-between gap-4" >
                                <div>
                                    <div className="kicker mb-2" > Bulk Upload </div>
                                    < h2 className="font-serif text-[24px] text-grove-text" > Unggah banyak file sekaligus </h2>
                                </div>
                                < div className="text-[10px] text-grove-muted2" > PDF / XLSX multiple files </div>
                            </div>

                            < div
                                ref={bulkDropRef}
                                onDragOver={handleBulkDragOver}
                                onDragLeave={handleBulkDragLeave}
                                onDrop={onBulkDrop}
                                onClick={() => bulkFileInputRef.current?.click()}
                                className={`group rounded-[20px] border border-dashed p-6 transition ${bulkDragActive ? "border-grove-primary bg-[linear-gradient(180deg,rgba(26,35,36,0.95),rgba(18,25,26,1))] shadow-[0_0_0_1px_rgba(95,184,138,0.18)]" : "border-grove-border bg-[linear-gradient(180deg,rgba(26,35,36,0.7),rgba(18,25,26,0.96))] hover:border-grove-primary/35 hover:bg-[linear-gradient(180deg,rgba(26,35,36,0.9),rgba(18,25,26,1))]"}`}
                            >
                                <div className="flex items-center gap-4" >
                                    <div className="rounded-[18px] border border-grove-border bg-grove-dim p-3" >
                                        <GripVertical className="h-5 w-5 text-grove-primary" />
                                    </div>
                                    < div >
                                        <div className="text-[14px] font-medium text-grove-text" > Drag & drop file laporan ke area ini </div>
                                        < div className="mt-1 text-[11px] text-grove-muted2" > Klik juga bisa.Semua file akan masuk antrean pending.</div>
                                    </div>
                                </div>
                                < div className="mt-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.16em] text-grove-muted2" >
                                    <span className={`rounded-full border px-3 py-1 ${bulkDragActive ? "border-grove-primary text-grove-primary" : "border-grove-border"}`}> Drop here </span>
                                    < span className="rounded-full border border-grove-border px-3 py-1" > Multiple files </span>
                                    < span className="rounded-full border border-grove-border px-3 py-1" > PDF / XLSX </span>
                                </div>
                                < input
                                    ref={bulkFileInputRef}
                                    type="file"
                                    multiple
                                    accept=".pdf,.xlsx,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                    className="hidden"
                                    onChange={(event) => queueBulkFiles(event.target.files)}
                                />
                            </div>

                            < div className="mt-4 space-y-3" >
                                {
                                    bulkFiles.length ? (
                                        bulkFiles.map((item) => (
                                            <div key={item.id} className="rounded-[18px] border border-grove-border bg-grove-bg3 p-4" >
                                                <div className="flex items-start justify-between gap-4" >
                                                    <div className="min-w-0" >
                                                        <div className="flex items-center gap-2 text-[13px] text-grove-text" >
                                                            <FileText className="h-4 w-4 text-grove-primary" />
                                                            <span className="truncate" > {item.file.name} </span>
                                                        </div>
                                                        < div className="mt-1 text-[11px] text-grove-muted2" > {formatFileSize(item.file.size)} </div>
                                                    </div>
                                                    < div className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-medium ${getStatusTone(item.status)}`}>
                                                        {getIconForStatus(item.status)}
                                                        {item.status}
                                                    </div>
                                                </div>
                                                < div className="mt-3" >
                                                    <ProgressBar value={item.progress} />
                                                </div>
                                                < div className="mt-3 flex justify-end" >
                                                    <button
                                                        type="button"
                                                        onClick={() => removeBulkFile(item.id)}
                                                        className="text-[11px] text-grove-muted2 transition hover:text-grove-text"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="rounded-[18px] border border-grove-border bg-grove-bg3 p-4 text-[11px] text-grove-muted2" >
                                            Belum ada file dipilih.
                                        </div>
                                    )}
                            </div>

                            < div className="mt-5 flex flex-wrap items-center gap-3" >
                                <button
                                    type="button"
                                    onClick={handleBulkUploadAll}
                                    disabled={!bulkFiles.length || bulkUploadLoading}
                                    className="inline-flex items-center gap-2 rounded-full bg-grove-primary px-4 py-2.5 text-[12px] font-medium text-[#09130f] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {bulkUploadLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                    {bulkUploadLoading ? "Uploading..." : "Upload All"}
                                </button>
                                < button
                                    type="button"
                                    onClick={clearBulkFiles}
                                    disabled={!bulkFiles.length}
                                    className="inline-flex items-center gap-2 rounded-full border border-grove-border bg-transparent px-4 py-2.5 text-[12px] font-medium text-grove-text transition hover:border-grove-primary/30 hover:text-grove-primary disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Clear All
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                < aside className="panel overflow-hidden p-5 md:p-6" >
                    <div className="flex items-center justify-between gap-4" >
                        <div>
                            <div className="kicker mb-2" > Upload Notes </div>
                            < h3 className="font-serif text-[22px] text-grove-text" > Workflow singkat </h3>
                        </div>
                        < div className="rounded-full border border-grove-border bg-grove-dim px-3 py-1 text-[10px] text-grove-primary" >
                            Read only review
                        </div>
                    </div>

                    < div className="mt-4 space-y-3 text-[12px] text-grove-muted2" >
                        <div className="rounded-[16px] border border-grove-border bg-grove-bg3 p-4" >
                            <div className="mb-1 text-grove-text" > 1. Upload file </div>
                            PDF atau XLSX untuk laporan PubEx, Paparan Publik, atau Annual Report.
                        </div>
                        < div className="rounded-[16px] border border-grove-border bg-grove-bg3 p-4" >
                            <div className="mb-1 text-grove-text" > 2. Parsing berjalan </div>
                            Status berubah dari Pending ke Processing lalu Done atau Failed.
                        </div>
                        < div className="rounded-[16px] border border-grove-border bg-grove-bg3 p-4" >
                            <div className="mb-1 text-grove-text" > 3. Review hasil </div>
                            Klik Lihat Hasil hanya jika upload selesai.
                        </div>
                    </div>

                    < div className="mt-5 rounded-[18px] border border-grove-border bg-[rgba(95,184,138,0.06)] p-4" >
                        <div className="flex items-center gap-2 text-[12px] text-grove-text" >
                            <Eye className="h-4 w-4 text-grove-primary" />
                            Output parsing
                        </div>
                        < p className="mt-2 text-[11px] leading-6 text-grove-muted2" >
                            Hasil review di bawah bersifat read only.Tidak ada approve / reject agar alur admin tetap fokus ke validasi data dan re - upload bila perlu.
                        </p>
                    </div>
                </aside>
            </section>

            < section className="mt-6 rounded-[24px] border border-grove-border bg-grove-bg2 p-5 md:p-6" >
                <div className="mb-4 flex items-end justify-between gap-4" >
                    <div>
                        <div className="kicker mb-2" > Upload History </div>
                        < h2 className="font-serif text-[24px] text-grove-text" > Semua file yang sudah diupload </h2>
                    </div>
                    < div className="text-[11px] text-grove-muted2" > Tabel riwayat dengan aksi lihat hasil </div>
                </div>

                < div className="overflow-x-auto rounded-[18px] border border-grove-border" >
                    <table className="min-w-full text-left text-[12px]" >
                        <thead className="bg-grove-bg3 text-[10px] uppercase tracking-[0.14em] text-grove-muted2" >
                            <tr>
                                <th className="px-4 py-3" > Emiten </th>
                                < th className="px-4 py-3" > Tahun </th>
                                < th className="px-4 py-3" > Jenis Laporan </th>
                                < th className="px-4 py-3" > Tanggal Upload </th>
                                < th className="px-4 py-3" > Status </th>
                                < th className="px-4 py-3" > Aksi </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                history.map((row) => (
                                    <tr key={row.id} className="border-t border-grove-border bg-grove-bg2 transition hover:bg-grove-bg3/70" >
                                        <td className="px-4 py-4" >
                                            <div className="font-medium text-grove-text" > {row.ticker} </div>
                                            < div className="mt-1 text-[11px] text-grove-muted2" > {row.issuerName} </div>
                                        </td>
                                        < td className="px-4 py-4 text-grove-text" > {row.year} </td>
                                        < td className="px-4 py-4 text-grove-text" > {row.reportType} </td>
                                        < td className="px-4 py-4 text-grove-muted2" > {row.uploadDate} </td>
                                        < td className="px-4 py-4" >
                                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-medium ${getStatusTone(row.status)}`}>
                                                {row.status === "Processing" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : row.status === "Done" ? <CheckCircle2 className="h-3.5 w-3.5" /> : < X className="h-3.5 w-3.5" />}
                                                {row.status}
                                            </span>
                                        </td>
                                        < td className="px-4 py-4" >
                                            <button
                                                type="button"
                                                onClick={() => setActiveResult(row)}
                                                disabled={row.status !== "Done"}
                                                className="inline-flex items-center gap-2 rounded-full border border-grove-border bg-transparent px-3 py-2 text-[11px] font-medium text-grove-text transition hover:border-grove-primary/30 hover:text-grove-primary disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                <Eye className="h-4 w-4" />
                                                Lihat Hasil
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {
                activeResult ? (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/65 px-3 py-4 backdrop-blur-[6px] md:items-center" >
                        <div className="w-full max-w-4xl overflow-hidden rounded-[24px] border border-grove-border bg-grove-bg2 shadow-[0_24px_90px_rgba(0,0,0,0.55)]" >
                            <div className="flex items-start justify-between gap-4 border-b border-grove-border bg-grove-bg3 px-5 py-4 md:px-6" >
                                <div>
                                    <div className="kicker mb-2" > Lihat Hasil </div>
                                    < h3 className="font-serif text-[24px] text-grove-text" >
                                        {activeResult.ticker} · {activeResult.year} · {activeResult.reportType}
                                    </h3>
                                    < div className="mt-2 text-[11px] text-grove-muted2" > Read only review hasil parsing laporan.</div>
                                </div>
                                < button
                                    type="button"
                                    onClick={() => setActiveResult(null)
                                    }
                                    className="rounded-full border border-grove-border bg-transparent p-2 text-grove-muted2 transition hover:border-grove-primary/30 hover:text-grove-text"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            < div className="max-h-[80vh] overflow-y-auto p-5 md:p-6" >
                                {
                                    lowConfidence ? (
                                        <div className="mb-4 flex items-start gap-3 rounded-[16px] border border-grove-amber/30 bg-[rgba(240,160,48,0.08)] px-4 py-3 text-[12px] text-grove-amber" >
                                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                            <div>Hasil parsing mungkin tidak akurat, pertimbangkan upload ulang </div>
                                        </div>
                                    ) : null}

                                <div className="grid gap-4 md:grid-cols-[0.72fr_1.28fr]">
                                    <div className="rounded-[18px] border border-grove-border bg-grove-bg3 p-4">
                                        <div className="text-[10px] uppercase tracking-[0.16em] text-grove-muted2">Confidence score</div>
                                        <div className="mt-2 text-4xl font-semibold text-grove-text">{activeResult.confidence}%</div>
                                        <div className="mt-3 text-[11px] text-grove-muted2">
                                            Semakin tinggi score, semakin stabil hasil ekstraksi struktur laporan.
                                        </div>
                                        <div className="mt-4">
                                            <ProgressBar value={activeResult.confidence} />
                                        </div>
                                        <div className="mt-4 grid gap-2 text-[11px] text-grove-muted2">
                                            <div className="rounded-[14px] border border-grove-border bg-grove-bg2 px-3 py-2">
                                                Emiten: <span className="text-grove-text">{activeResult.issuerName}</span>
                                            </div>
                                            <div className="rounded-[14px] border border-grove-border bg-grove-bg2 px-3 py-2">
                                                Tahun: <span className="text-grove-text">{activeResult.year}</span>
                                            </div>
                                            <div className="rounded-[14px] border border-grove-border bg-grove-bg2 px-3 py-2">
                                                Jenis: <span className="text-grove-text">{activeResult.reportType}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-[18px] border border-grove-border bg-grove-bg3 p-4">
                                        <div className="mb-3 text-[10px] uppercase tracking-[0.16em] text-grove-muted2">Segmen operasi hasil extract</div>
                                        <div className="overflow-hidden rounded-[14px] border border-grove-border">
                                            <table className="min-w-full text-left text-[12px]">
                                                <thead className="bg-grove-bg2 text-[10px] uppercase tracking-[0.14em] text-grove-muted2">
                                                    <tr>
                                                        <th className="px-3 py-3">Nama Segmen</th>
                                                        <th className="px-3 py-3">Revenue</th>
                                                        <th className="px-3 py-3">Pertumbuhan YoY</th>
                                                        <th className="px-3 py-3">Kontribusi %</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {activeResult.segments.map((segment) => (
                                                        <tr key={segment.name} className="border-t border-grove-border bg-grove-bg3">
                                                            <td className="px-3 py-3 text-grove-text">{segment.name}</td>
                                                            <td className="px-3 py-3 text-grove-text">{segment.revenue}</td>
                                                            <td className="px-3 py-3 text-grove-primary">{segment.growth}</td>
                                                            <td className="px-3 py-3 text-grove-text">{segment.contribution}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                < div className="mt-5 flex flex-wrap items-center justify-end gap-3" >
                                    <button
                                        type="button"
                                        onClick={() => setActiveResult(null)}
                                        className="inline-flex items-center gap-2 rounded-full border border-grove-border bg-transparent px-4 py-2.5 text-[12px] font-medium text-grove-text transition hover:border-grove-primary/30 hover:text-grove-primary"
                                    >
                                        Tutup
                                    </button>
                                    < button
                                        type="button"
                                        onClick={() => reopenUploadForResult(activeResult)}
                                        className="inline-flex items-center gap-2 rounded-full bg-grove-primary px-4 py-2.5 text-[12px] font-medium text-[#09130f] transition hover:brightness-110"
                                    >
                                        <ArrowUpRight className="h-4 w-4" />
                                        Upload Ulang
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
        </main>
    );
}
