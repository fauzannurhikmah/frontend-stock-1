import { bandarmologyData } from "@/data/reportDetail";

const OWNERSHIP_COLORS = ["#3A9EE8", "#22C97A", "#C8A84B", "#9A72E8"];

export function BandarmologySection({ ticker }: { ticker: string }) {
  const data = bandarmologyData[ticker] ?? bandarmologyData.default;
  const ownerColor =
    data.foreign > 30
      ? "var(--green)"
      : data.foreign > 20
        ? "var(--amber)"
        : "var(--muted2)";
  const segments = [
    {
      label: "Investor Asing",
      value: data.foreign,
      color: OWNERSHIP_COLORS[0],
    },
    {
      label: "Institusi Domestik",
      value: data.domestic,
      color: OWNERSHIP_COLORS[1],
    },
    { label: "Publik / Ritel", value: data.retail, color: OWNERSHIP_COLORS[2] },
    {
      label: "Pemerintah / Pendiri",
      value: data.publi,
      color: OWNERSHIP_COLORS[3],
    },
  ];

  let acc = 0;
  const gradient = segments
    .map((segment) => {
      const start = acc;
      acc += segment.value;
      return `${segment.color} ${start}% ${acc}%`;
    })
    .join(", ");

  return (
    <section className="bandar-wrap">
      <div className="bandar-summary">
        <div className="bandar-sum-card">
          <div className="bandar-sum-lbl">Kepemilikan Asing</div>
          <div className="bandar-sum-val" style={{ color: ownerColor }}>
            {data.foreign}%
          </div>
        </div>
        <div className="bandar-sum-card">
          <div className="bandar-sum-lbl">Net Buy 1 Bulan</div>
          <div
            className="bandar-sum-val"
            style={{
              color: data.netBuy.startsWith("+")
                ? "var(--green)"
                : "var(--amber)",
            }}
          >
            {data.netBuy}
          </div>
        </div>
        <div className="bandar-sum-card">
          <div className="bandar-sum-lbl">Signal Institusi</div>
          <div
            className="bandar-sum-val"
            style={{
              fontSize: "14px",
              color:
                data.score === "Akumulasi" ? "var(--green)" : "var(--amber)",
            }}
          >
            {data.score}
          </div>
        </div>
        <div className="bandar-sum-card">
          <div className="bandar-sum-lbl">Tren Kepemilikan Asing</div>
          <div
            className="bandar-sum-val"
            style={{
              fontSize: "13px",
              color: data.trend.includes("+") ? "var(--green)" : "var(--amber)",
            }}
          >
            {data.trend}
          </div>
        </div>
      </div>

      <div className="bandar-ownership">
        <div className="bandar-own-hdr">
          <span className="bandar-own-ttl">Struktur Kepemilikan Saham</span>
          <span className="text-[10px] text-grove-muted">
            KSEI Data · Apr 2026
          </span>
        </div>
        <div className="bo-chart-area">
          <div className="relative flex h-[160px] w-[160px] items-center justify-center">
            <div
              className="h-[160px] w-[160px] rounded-full"
              style={{ background: `conic-gradient(${gradient})` }}
            />
            <div
              className="absolute h-[96px] w-[96px] rounded-full border border-grove-border"
              style={{ background: "var(--bg2)" }}
            />
          </div>
          <div className="bo-legend">
            {segments.map((segment, index) => (
              <div key={segment.label} className="bo-leg-item">
                <div
                  className="bo-leg-dot"
                  style={{ background: OWNERSHIP_COLORS[index] }}
                />
                <span className="bo-leg-name">{segment.label}</span>
                <span className="bo-leg-pct">{segment.value}%</span>
                <span
                  className={`bo-leg-trend ${
                    index === 0 ? "pos" : index === 2 ? "neg" : ""
                  }`}
                  style={
                    index === 1 || index === 3
                      ? { color: "var(--muted2)" }
                      : undefined
                  }
                >
                  {index === 0 ? "↑" : index === 2 ? "↓" : "→"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="broker-flow">
        <div className="bf-hdr">
          Broker Flow Summary — 20 Hari Trading Terakhir
        </div>
        <div
          className="bf-row"
          style={{ background: "var(--bg3)", fontSize: "9px" }}
        >
          <span>Broker</span>
          <span style={{ textAlign: "right" }}>Buy</span>
          <span style={{ textAlign: "right" }}>Sell</span>
          <span style={{ textAlign: "right" }}>Net</span>
        </div>
        {data.brokers.map((broker) => (
          <div key={broker.name} className="bf-row">
            <span className="bf-broker">{broker.name}</span>
            <span className="bf-buy">{broker.buy}</span>
            <span className="bf-sell">{broker.sell}</span>
            <span className={`bf-net ${broker.pos ? "pos" : "neg"}`}>
              {broker.net}
            </span>
          </div>
        ))}
      </div>

      <div className="bandar-analysis">
        <div className="ba-title">
          Interpretasi Bandarmology — Tim Riset Grove
        </div>
        {data.signal.map((signal) => (
          <div key={signal} className="ba-row">
            <div className="ba-dot" style={{ background: "var(--grove)" }} />
            <div
              className="ba-txt"
              dangerouslySetInnerHTML={{ __html: signal }}
            />
          </div>
        ))}
      </div>

      <div className="disc">
        Data bandarmology bersifat ilustratif berdasarkan metodologi analisis
        internal Grove. Broker flow actual dapat berbeda. Bukan merupakan ajakan
        beli atau jual.
      </div>
    </section>
  );
}
