import { useMemo, useState } from "react";
import { ResearchAsset, ResearchHorizon } from "@/lib/types";

const stanceLabel: Record<string, string> = {
  ow: "Overweight",
  nt: "Neutral",
  uw: "Underweight",
};

const horizonLabel: Record<ResearchHorizon, string> = {
  lt: "Long Term · 1–3 Tahun",
  mt: "Medium Term · 3–12 Bulan",
  st: "Short Term · 1–8 Minggu",
};

const DEFAULT_CATALYSTS = [
  "Pertumbuhan kredit stabil dan biaya dana tetap terkendali.",
  "Momentum laba konsisten dengan outlook konsensus pasar.",
  "Likuiditas tetap kuat dengan sentimen risk-on domestik.",
];

const DEFAULT_RISKS = [
  "Tekanan nilai tukar dapat menekan biaya dana.",
  "Permintaan kredit melambat di tengah pengetatan likuiditas.",
  "Volatilitas global memicu outflow jangka pendek.",
];

export function AnalysisSection({ asset }: { asset: ResearchAsset }) {
  const [activeHz, setActiveHz] = useState<ResearchHorizon>("lt");

  const scenarioData = useMemo(() => {
    const data = asset[activeHz];
    const evRaw = data.ev;
    const evNum = Math.abs(parseFloat(evRaw.replace(/[^0-9.\-]/g, "")) || 0);
    const evIsNeg = evRaw.trim().startsWith("-");
    const baseProb = Math.max(0, 100 - data.prob - data.neg);

    return {
      expectedReturn: evRaw,
      probPos: data.prob,
      probNeg: data.neg,
      probBase: baseProb,
      scenarios: [
        {
          tag: "Bull",
          title: "Katalis besar terealisasi penuh",
          prob: Math.round(data.prob * 0.38),
          ret: `+${Math.round(evNum * 2.3)}–${Math.round(evNum * 3)}%`,
          note: "Semua faktor positif selaras, market re-rating penuh",
          tone: "text-grove-green",
          bar: "bg-grove-green",
          bg: "bg-[#22C97A14] border-[#22C97A33]",
        },
        {
          tag: "Moderate",
          title: "Tumbuh sesuai ekspektasi",
          prob: Math.round(data.prob * 0.62),
          ret: evRaw,
          note: "Base case — katalis terealisasi sebagian",
          tone: "text-grove-primary",
          bar: "bg-grove-primary",
          bg: "bg-[#5FB88A14] border-[#5FB88A33]",
        },
        {
          tag: "Base",
          title: "Sideways, tanpa trigger",
          prob: baseProb,
          ret: "-5–+5%",
          note: "Tidak ada katalis, harga mengikuti market",
          tone: "text-grove-muted2",
          bar: "bg-grove-muted2",
          bg: "bg-grove-bg3 border-grove-border",
        },
        {
          tag: "Bear",
          title: "Tekanan jual & gagal",
          prob: Math.round(data.neg * 0.7),
          ret: `-${Math.round(evNum * 1.5)}–${Math.round(evNum * 2.3)}%`,
          note: "Fundamental melemah atau sentimen negatif dominan",
          tone: "text-grove-amber",
          bar: "bg-grove-amber",
          bg: "bg-[#F0A03014] border-[#F0A03033]",
        },
        {
          tag: "Worst",
          title: "Shock eksternal sistemik",
          prob: Math.round(data.neg * 0.3),
          ret: `-${Math.round(evNum * 3)}–${Math.round(evNum * 4.5)}%`,
          note: "Krisis sistemik, black swan",
          tone: "text-grove-red",
          bar: "bg-grove-red",
          bg: "bg-[#E0484814] border-[#E0484833]",
        },
      ],
      verdict: {
        stance: stanceLabel[data.stance] ?? data.stance,
        score: data.score,
        ev: evRaw,
        tone: evIsNeg ? "text-grove-red" : "text-grove-green",
      },
    };
  }, [asset, activeHz]);

  const probColor = (value: number) =>
    value >= 60
      ? "text-grove-green"
      : value >= 45
        ? "text-grove-amber"
        : "text-grove-red";
  const scoreColor = (value: number) =>
    value >= 75
      ? "text-grove-green"
      : value >= 60
        ? "text-grove-amber"
        : "text-grove-red";

  return (
    <section className="mb-4">
      <div className="mb-4 flex gap-2 rounded-grove border border-grove-border bg-grove-bg3 p-1">
        {(Object.keys(horizonLabel) as ResearchHorizon[]).map((hz) => (
          <button
            key={hz}
            onClick={() => setActiveHz(hz)}
            className={`flex-1 rounded-[6px] px-3 py-2 text-[10.5px] font-medium transition-all ${
              activeHz === hz
                ? "bg-grove-bg2 text-grove-primary border border-grove-primary/30"
                : "text-grove-muted2"
            }`}
          >
            {horizonLabel[hz]}
          </button>
        ))}
      </div>

      <div className="mb-3 grid gap-2 md:grid-cols-3">
        <article className="rounded-grove border border-grove-border bg-grove-bg2 p-3">
          <p className="text-[9px] uppercase tracking-[.08em] text-grove-muted">
            Expected Return
          </p>
          <p className={`font-serif text-[20px] ${scenarioData.verdict.tone}`}>
            {scenarioData.expectedReturn}
          </p>
          <p className="text-[10px] text-grove-muted2">Probability-weighted</p>
        </article>
        <article className="rounded-grove border border-grove-border bg-grove-bg2 p-3">
          <p className="text-[9px] uppercase tracking-[.08em] text-grove-muted">
            Probabilitas Positif
          </p>
          <p
            className={`font-serif text-[20px] ${probColor(scenarioData.probPos)}`}
          >
            {scenarioData.probPos}%
          </p>
          <p className="text-[10px] text-grove-muted2">Return di atas 0%</p>
        </article>
        <article className="rounded-grove border border-grove-border bg-grove-bg2 p-3">
          <p className="text-[9px] uppercase tracking-[.08em] text-grove-muted">
            Research Score
          </p>
          <p
            className={`font-serif text-[20px] ${scoreColor(scenarioData.verdict.score)}`}
          >
            {scenarioData.verdict.score}
            <span className="ml-1 text-[12px] text-grove-muted">/100</span>
          </p>
          <p className="text-[10px] text-grove-muted2">Penilaian internal</p>
        </article>
      </div>

      <div className="mb-4 rounded-grove-2 border border-grove-border bg-grove-bg2">
        <div className="flex items-center justify-between border-b border-grove-border px-4 py-3">
          <span className="text-[11px] font-medium text-grove-muted2">
            Distribusi 5 Skenario Probabilistik
          </span>
          <span
            className={`text-[12px] font-medium ${scenarioData.verdict.tone}`}
          >
            {scenarioData.expectedReturn} expected
          </span>
        </div>
        <div className="grid gap-2 p-4 md:grid-cols-5">
          {scenarioData.scenarios.map((item) => (
            <div
              key={item.tag}
              className={`rounded-[8px] border px-3 py-3 text-center ${item.bg}`}
            >
              <div
                className={`text-[9px] font-medium uppercase tracking-[.05em] ${item.tone}`}
              >
                {item.tag}
              </div>
              <div className="mt-1 text-[9px] text-grove-muted2">
                {item.title}
              </div>
              <div className={`mt-2 font-serif text-[18px] ${item.tone}`}>
                {item.prob}%
              </div>
              <div className={`text-[10px] font-medium ${item.tone}`}>
                {item.ret}
              </div>
              <div className="mt-2 text-[9px] text-grove-muted2">
                {item.note}
              </div>
              <div className="mt-2 h-[2px] w-full rounded-full bg-grove-border">
                <div
                  className={`h-full rounded-full ${item.bar}`}
                  style={{ width: `${item.prob}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="grid gap-2 px-4 pb-4 md:grid-cols-4">
          <div className="rounded-[6px] bg-grove-bg3 p-2 text-center">
            <div
              className={`font-serif text-[16px] ${scenarioData.verdict.tone}`}
            >
              {scenarioData.expectedReturn}
            </div>
            <div className="text-[9px] text-grove-muted">Expected Return</div>
          </div>
          <div className="rounded-[6px] bg-grove-bg3 p-2 text-center">
            <div className="font-serif text-[16px] text-grove-green">
              {scenarioData.probPos}%
            </div>
            <div className="text-[9px] text-grove-muted">Prob. Positif</div>
          </div>
          <div className="rounded-[6px] bg-grove-bg3 p-2 text-center">
            <div className="font-serif text-[16px] text-grove-amber">
              {scenarioData.probBase}%
            </div>
            <div className="text-[9px] text-grove-muted">Prob. Sideways</div>
          </div>
          <div className="rounded-[6px] bg-grove-bg3 p-2 text-center">
            <div className="font-serif text-[16px] text-grove-red">
              {scenarioData.probNeg}%
            </div>
            <div className="text-[9px] text-grove-muted">Prob. Negatif</div>
          </div>
        </div>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-grove-2 border border-grove-border bg-grove-bg2">
          <div className="border-b border-grove-border px-4 py-2 text-[10px] uppercase tracking-[.05em] text-grove-green">
            Katalis Utama
          </div>
          <div className="space-y-2 p-4 text-[11px] text-grove-muted2">
            {DEFAULT_CATALYSTS.map((item) => (
              <div key={item} className="flex gap-2">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-grove-green" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-grove-2 border border-grove-border bg-grove-bg2">
          <div className="border-b border-grove-border px-4 py-2 text-[10px] uppercase tracking-[.05em] text-grove-red">
            Risiko Utama
          </div>
          <div className="space-y-2 p-4 text-[11px] text-grove-muted2">
            {DEFAULT_RISKS.map((item) => (
              <div key={item} className="flex gap-2">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-grove-red" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-3 rounded-grove-2 border border-grove-border bg-grove-bg2">
        <div className="grid border-b border-grove-border md:grid-cols-3">
          <div className="border-r border-grove-border p-4 text-center">
            <div className="text-[9px] uppercase tracking-[.09em] text-grove-muted">
              Stance
            </div>
            <div className="mt-2 inline-flex rounded-full border border-grove-primary/30 bg-grove-primary/10 px-4 py-1 text-[11px] text-grove-primary">
              {scenarioData.verdict.stance}
            </div>
          </div>
          <div className="border-r border-grove-border p-4 text-center">
            <div className="text-[9px] uppercase tracking-[.09em] text-grove-muted">
              Research Score
            </div>
            <div
              className={`font-serif text-[22px] ${scoreColor(scenarioData.verdict.score)}`}
            >
              {scenarioData.verdict.score}
              <span className="ml-1 text-[12px] text-grove-muted">/100</span>
            </div>
          </div>
          <div className="p-4 text-center">
            <div className="text-[9px] uppercase tracking-[.09em] text-grove-muted">
              Expected Return
            </div>
            <div
              className={`font-serif text-[22px] ${scenarioData.verdict.tone}`}
            >
              {scenarioData.expectedReturn}
            </div>
          </div>
        </div>
        <div className="p-4 text-[12px] leading-[1.7] text-grove-muted2">
          Penilaian Grove dibuat berdasarkan probabilitas skenario dan asumsi
          makro saat ini. Gunakan sebagai panduan, bukan sinyal beli/jual.
        </div>
      </div>

      <div className="rounded-grove border border-grove-border bg-grove-bg2 px-4 py-3 text-[10px] text-grove-muted">
        Penilaian Grove ini dibuat oleh tim riset berdasarkan analisis internal
        & data ilustratif. Past performance tidak menjamin hasil di masa depan.
      </div>
    </section>
  );
}
