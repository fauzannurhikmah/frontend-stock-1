import React, { useEffect, useState } from 'react'
import { formatCurrency } from './TechnicalSection';
import { API_BASE_URL } from '@/lib/env';
import { CalendarOff } from 'lucide-react';

interface StockPrice {
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
}

const TestStockPrice = ({ companyName, listingId }: { companyName: string; listingId?: string }) => {
    const [date, setDate] = useState("2026-05-29");
    const [price, setPrice] = useState<StockPrice | null>(null);
    const [noData, setNoData] = useState(false);

    const isWeekend = (dateStr: string) => {
        const d = new Date(dateStr);
        const day = d.getDay();
        return day === 0 || day === 6; // 0 = Minggu, 6 = Sabtu
    };

    useEffect(() => {
        if (!listingId || !date) return;
        setNoData(false);
        setPrice(null);
        fetch(`${API_BASE_URL}/stock-price?listingId=${listingId}&date=${date}`)
            .then((r) => r.json())
            .then((data) => {
                const isEmpty =
                    !data ||
                    (typeof data === "object" && Object.keys(data).length === 0) ||
                    (!data.open && !data.close && !data.high && !data.low && !data.volume);
                if (isEmpty) {
                    setPrice(null);
                    setNoData(true);
                } else {
                    setPrice(data);
                    setNoData(false);
                }
            })
            .catch(() => {
                setPrice(null);
                setNoData(true);
            });
    }, [listingId, date]);

    return (
        <div>
            {/* testing stock price */}
            <div className="tek-wyckoff-header flex items-center justify-between mb-4">
                <div className="tek-wyckoff-title">{companyName}</div>
                <input
                    type="date"
                    max="2026-05-29"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-white/5 border border-white/10 hover:border-white/20 text-white/70 text-[11px] rounded-md px-2.5 py-1.5 cursor-pointer outline-none focus:border-white/30 focus:text-white/90 transition-colors"
                />
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">

                {/* Kolom 1 - Open & High */}
                <div className="flex flex-col gap-2">
                    <div className="tek-ind">
                        <div className="tek-ind-lbl">Open Price</div>
                        <div className="tek-ind-val" style={{ fontSize: "12px" }}>
                            {price ? formatCurrency(Number(price.open)) : "—"}
                        </div>
                    </div>


                    <div className="tek-ind">
                        <div className="tek-ind-lbl">Close Price</div>
                        <div className="tek-ind-val" style={{ fontSize: "12px" }}>
                            {price ? formatCurrency(Number(price.close)) : "—"}
                        </div>
                    </div>
                </div>

                {/* Kolom 2 - Close & Low */}
                <div className="flex flex-col gap-2">
                    <div className="tek-ind">
                        <div className="tek-ind-lbl">High Price</div>
                        <div className="tek-ind-val" style={{ fontSize: "12px" }}>
                            {price ? formatCurrency(Number(price.high)) : "—"}
                        </div>
                    </div>
                    <div className="tek-ind">
                        <div className="tek-ind-lbl">Low Price</div>
                        <div className="tek-ind-val" style={{ fontSize: "12px" }}>
                            {price ? formatCurrency(Number(price.low)) : "—"}
                        </div>
                    </div>
                </div>

                {/* Kolom 3 - Volume */}
                <div className="tek-ind flex flex-col justify-center items-center text-center">
                    <div className="tek-ind-lbl">Volume</div>
                    <div className="tek-ind-val" style={{ fontSize: "12px" }}>
                        {price ? Number(price.volume).toLocaleString("id-ID") : "—"}
                    </div>
                </div>

            </div>

            {/* No data - holiday/weekend notice */}
            {noData && (
                <div className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 mt-1"
                    style={{ background: "rgba(250,180,50,0.08)", border: "1px solid rgba(250,180,50,0.2)" }}>
                    <CalendarOff size={14} style={{ color: "rgba(250,180,50,0.9)", marginTop: "1px", flexShrink: 0 }} />
                    <div>
                        <div style={{ fontSize: "11px", fontWeight: 600, color: "rgba(250,180,50,0.9)", marginBottom: "1px" }}>
                            Data tidak tersedia
                        </div>
                        <div style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
                            {isWeekend(date)
                                ? "Tanggal ini jatuh pada hari Sabtu/Minggu. Bursa saham tidak beroperasi di akhir pekan."
                                : "Tidak ada data perdagangan untuk tanggal ini. Kemungkinan merupakan hari libur nasional atau tanggal merah bursa (BEI)."}
                        </div>
                    </div>
                </div>
            )}

            {/* end testing stock price */}
        </div>
    )
}

export default TestStockPrice