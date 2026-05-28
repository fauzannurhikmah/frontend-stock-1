import type {
  ReportFinancials,
  KsRow,
  KsData,
  IsData,
  SegItem,
} from "@/data/reportFinancials";
import type { ResearchAsset } from "@/lib/types";
import { COLOR_MAP } from "@/lib/research-utils";

type SegDefLine = {
  l: string;
  base: number;
  sub?: boolean;
  bold?: boolean;
  hl?: boolean;
};

type SegDef = {
  name: string;
  rev: string;
  growth: string;
  pct: number;
  color: string;
  lines: SegDefLine[];
};

type IntlSegDef = {
  n: string;
  r: string;
  g: string;
  p: number;
  c: string;
};

function qRow(
  p: string,
  v: string,
  g?: string | null,
  pos?: boolean | null,
  bold?: boolean,
): KsRow {
  return { p, v, g, pos, bold: Boolean(bold) };
}

function divRow(label: string): KsRow {
  return { p: "divider", label };
}

function genKS(
  baseNI: number,
  growPct: number,
  divYield: number,
  payout: number,
  mktCap: string,
  shares: number,
  ff: number,
  price: number,
  fy26Growth?: number,
): KsData {
  const qs = ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"];
  const ni = qs.map((p, i) =>
    qRow(
      p,
      `${(baseNI * (1 + i * 0.03)).toFixed(2)} B`,
      `+${(growPct - i * 0.5).toFixed(1)}%`,
      true,
    ),
  );
  ni.push(
    qRow(
      "TTM",
      `${(baseNI * 4.18).toFixed(2)} B`,
      `+${growPct.toFixed(1)}%`,
      true,
      true,
    ),
  );

  const fy26g = fy26Growth ?? 8;
  const fy26NI = baseNI * 4.18 * (1 + fy26g / 100);
  ni.push({
    p: "FY 2026E",
    v: `${fy26NI.toFixed(2)} B`,
    g: `+${fy26g.toFixed(1)}%`,
    pos: fy26g >= 0,
    bold: true,
    fc: true,
  });
  ni.push(divRow("Dividen & Yield"));
  ni.push(
    qRow(
      "Div (TTM)",
      `${((baseNI * 4 * payout) / shares).toFixed(0)}`,
      null,
      null,
    ),
  );
  ni.push(qRow("Payout Ratio", `${(payout * 100).toFixed(0)}%`, null, null));
  ni.push(qRow("Div Yield", `${divYield}%`, null, null));

  const eps = qs.map((p, i) =>
    qRow(
      p,
      `${((baseNI * (1 + i * 0.03) * 1000) / shares).toFixed(1)}`,
      `+${(growPct - i * 0.5).toFixed(1)}%`,
      true,
    ),
  );
  const epsTTM = (baseNI * 4.18 * 1000) / shares;
  eps.push(
    qRow("TTM", epsTTM.toFixed(1), `+${growPct.toFixed(1)}%`, true, true),
  );
  const eps26 = (fy26NI * 1000) / shares;
  eps.push({
    p: "FY 2026E",
    v: eps26.toFixed(1),
    g: `+${fy26g.toFixed(1)}%`,
    pos: fy26g >= 0,
    bold: true,
    fc: true,
  });

  const revMult = 5.5;
  const rev = qs.map((p, i) =>
    qRow(
      p,
      `${(baseNI * revMult * (1 + i * 0.025)).toFixed(2)} B`,
      `+${(growPct * 0.6).toFixed(1)}%`,
      true,
    ),
  );
  rev.push(
    qRow(
      "TTM",
      `${(baseNI * revMult * 4.1).toFixed(2)} B`,
      `+${(growPct * 0.6).toFixed(1)}%`,
      true,
      true,
    ),
  );
  const fy26Rev = baseNI * revMult * 4.1 * (1 + (fy26g * 0.8) / 100);
  rev.push({
    p: "FY 2026E",
    v: `${fy26Rev.toFixed(2)} B`,
    g: `+${(fy26g * 0.8).toFixed(1)}%`,
    pos: fy26g >= 0,
    bold: true,
    fc: true,
  });

  const pe26 = price ? `${(price / eps26).toFixed(1)}x` : null;
  const peTTM = price ? `${(price / epsTTM).toFixed(1)}x` : null;

  return {
    netIncome: ni,
    eps,
    revenue: rev,
    extra: {
      mktCap,
      ev: "-",
      shares: `${shares.toFixed(2)} B`,
      ff: `${ff}%`,
      peTTM,
      pe26,
    },
  };
}

function genIS(baseRev: number, growthFY26?: number): IsData {
  const q = [1.0, 0.98, 1.02, 0.96, 0.94, 0.95];
  const g = growthFY26 == null ? 1.1 : 1 + growthFY26 / 100;
  const fy26 = 4 * baseRev * g;
  const fmt = (value: number) => `${value.toFixed(2)} B`;
  const fmtNeg = (value: number) => `(${value.toFixed(2)} B)`;

  return {
    cols: [
      "FY 2026E",
      "Q4 2025",
      "Q3 2025",
      "Q2 2025",
      "Q1 2025",
      "Q4 2024",
      "Q3 2024",
    ],
    rows: [
      {
        l: "Total Pendapatan",
        v: [fmt(fy26), ...q.map((x) => fmt(baseRev * x))],
        bold: true,
        fc: true,
      },
      {
        l: "Beban Pokok Penjualan",
        v: [fmtNeg(fy26 * 0.72), ...q.map((x) => fmtNeg(baseRev * x * 0.72))],
        neg: true,
        sub: true,
        fc: true,
      },
      {
        l: "Laba Kotor",
        v: [fmt(fy26 * 0.28), ...q.map((x) => fmt(baseRev * x * 0.28))],
        bold: true,
        hl: true,
        fc: true,
      },
      {
        l: "Beban Usaha",
        v: [fmtNeg(fy26 * 0.13), ...q.map((x) => fmtNeg(baseRev * x * 0.13))],
        neg: true,
        sub: true,
        fc: true,
      },
      {
        l: "EBIT",
        v: [fmt(fy26 * 0.15), ...q.map((x) => fmt(baseRev * x * 0.15))],
        bold: true,
        fc: true,
      },
      {
        l: "Beban Pajak",
        v: [fmtNeg(fy26 * 0.032), ...q.map((x) => fmtNeg(baseRev * x * 0.032))],
        neg: true,
        sub: true,
        fc: true,
      },
      {
        l: "Laba Bersih Tahun Berjalan",
        v: [fmt(fy26 * 0.12), ...q.map((x) => fmt(baseRev * x * 0.12))],
        bold: true,
        hl: true,
        fc: true,
      },
    ],
  };
}

function genSegs(segDefs: SegDef[]): SegItem[] {
  const q = [1.0, 0.97, 1.01, 0.94, 0.91, 0.93];
  const fy26Mult = 4.35;

  return segDefs.map((sd) => {
    const totalBase = sd.lines.reduce((sum, line) => sum + line.base, 0);
    return {
      name: sd.name,
      rev: sd.rev,
      growth: sd.growth,
      pct: sd.pct,
      color: sd.color,
      rows: [
        ...sd.lines.map((line) => ({
          l: line.l,
          v: [
            `${(line.base * fy26Mult).toFixed(2)} T`,
            ...q.map((x) => `${(line.base * x).toFixed(2)} T`),
          ],
          bold: Boolean(line.bold),
          sub: Boolean(line.sub),
          hl: Boolean(line.hl),
          fc: true,
        })),
        {
          l: "Total Segmen",
          v: [
            `${(totalBase * fy26Mult).toFixed(2)} T`,
            ...q.map((x) => `${(totalBase * x).toFixed(2)} T`),
          ],
          bold: true,
          hl: true,
          fc: true,
        },
      ],
    };
  });
}

function genIntlKS(
  ni: number,
  epsV: string,
  rev: number,
  mc: string,
  evV: string,
  shares: string,
  ff: string,
  price: number,
  growth: number,
): KsData {
  void price;
  const g = growth > 0 ? "+" : "";
  return {
    netIncome: [
      { p: "FY 2025", v: `${ni} B`, g: `${g}${growth}%`, pos: growth > 0 },
      {
        p: "FY 2026E",
        v: `${(ni * 1.08).toFixed(1)} B`,
        g: `${g}${growth + 2}%`,
        pos: true,
        bold: true,
        fc: true,
      },
      {
        p: "FY 2024",
        v: `${(ni * 0.92).toFixed(1)} B`,
        g: `${g}${growth - 3}%`,
        pos: growth > 3,
      },
      { p: "FY 2023", v: `${(ni * 0.85).toFixed(1)} B`, g: null, pos: true },
    ],
    eps: [
      { p: "FY 2025", v: epsV, g: `${g}${growth}%`, pos: growth > 0 },
      {
        p: "FY 2026E",
        v: (Number.parseFloat(epsV) * 1.08).toFixed(2),
        g: "+8%",
        pos: true,
        bold: true,
        fc: true,
      },
    ],
    revenue: [
      { p: "FY 2025", v: `${rev} B`, g: `${g}${growth + 5}%`, pos: true },
      {
        p: "FY 2026E",
        v: `${(rev * 1.07).toFixed(0)} B`,
        g: "+7%",
        pos: true,
        bold: true,
        fc: true,
      },
    ],
    extra: { mktCap: mc, ev: evV, shares, ff, peTTM: "18x", pe26: "16x" },
  };
}

function genIntlIS(rev: number, ni: number): IsData {
  const cols = ["FY 2026E", "FY 2025", "FY 2024", "FY 2023"];
  return {
    cols,
    rows: [
      {
        l: "Revenue",
        v: [
          `${(rev * 1.07).toFixed(0)} B`,
          `${rev} B`,
          `${(rev * 0.93).toFixed(0)} B`,
          `${(rev * 0.86).toFixed(0)} B`,
        ],
        bold: true,
        fc: true,
      },
      {
        l: "Gross Profit",
        v: [
          `${(rev * 1.07 * 0.45).toFixed(1)} B`,
          `${(rev * 0.45).toFixed(1)} B`,
          `${(rev * 0.93 * 0.43).toFixed(1)} B`,
          `${(rev * 0.86 * 0.41).toFixed(1)} B`,
        ],
        bold: true,
        hl: true,
        fc: true,
      },
      {
        l: "Operating Income",
        v: [
          `${(rev * 1.07 * 0.22).toFixed(1)} B`,
          `${(rev * 0.22).toFixed(1)} B`,
          `${(rev * 0.93 * 0.2).toFixed(1)} B`,
          `${(rev * 0.86 * 0.18).toFixed(1)} B`,
        ],
        bold: true,
        fc: true,
      },
      {
        l: "Net Income",
        v: [
          `${(ni * 1.08).toFixed(1)} B`,
          `${ni} B`,
          `${(ni * 0.92).toFixed(1)} B`,
          `${(ni * 0.85).toFixed(1)} B`,
        ],
        bold: true,
        hl: true,
        fc: true,
      },
    ],
  };
}

function genIntlSegs(segs: IntlSegDef[]): SegItem[] {
  return segs.map((seg) => ({
    name: seg.n,
    rev: seg.r,
    growth: seg.g,
    pct: seg.p,
    color: seg.c,
    rows: [
      { l: `${seg.n} Revenue`, v: [seg.r, seg.r, "-", "-"], bold: true },
      { l: "YoY Growth", v: [seg.g, seg.g, "-", "-"], sub: true },
    ],
  }));
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function parsePrice(value: string): number {
  const cleaned = value.replace(/[^0-9.,]/g, "").replace(/,/g, "");
  if (!cleaned) return 0;
  if (cleaned.includes(".") && cleaned.split(".").pop()?.length === 3) {
    return Number.parseFloat(cleaned.replace(/\./g, ""));
  }
  return Number.parseFloat(cleaned);
}

function pickColor(colorKey: string, fallback: string) {
  return COLOR_MAP[colorKey] ?? fallback;
}

export function buildSmallCapFinancials(
  asset: ResearchAsset,
): ReportFinancials {
  const rawPrice = parsePrice(asset.price);
  const priceNum = rawPrice > 0 ? rawPrice : 1000;
  const baseNI = (priceNum / 1000) * 0.12;
  const baseRev = baseNI * 6;
  const fy26Growth = 10;

  const ks = genKS(
    baseNI,
    10,
    3.5,
    0.45,
    `${((priceNum * 5) / 1000).toFixed(1)} T est`,
    Number.parseFloat((priceNum * 0.005).toFixed(2)),
    35,
    priceNum / 1000,
    fy26Growth,
  );
  const is = genIS(baseRev, fy26Growth);

  const sectorUpper = (asset.sector || "").toLowerCase();
  let segs: SegDef[];

  if (
    sectorUpper.includes("bank") ||
    sectorUpper.includes("keuang") ||
    sectorUpper.includes("insuran") ||
    sectorUpper.includes("multifin")
  ) {
    segs = [
      {
        name: "Pendapatan Bunga & Komisi",
        rev: "Est.",
        growth: "+10%",
        pct: 65,
        color: pickColor(asset.color, "#3A9EE8"),
        lines: [
          { l: "Net Interest Income", base: baseNI * 3.5, bold: true },
          { l: "Fee Income", base: baseNI * 0.8, sub: true },
        ],
      },
      {
        name: "Trading & Investasi",
        rev: "Est.",
        growth: "+8%",
        pct: 25,
        color: "#C8A84B",
        lines: [{ l: "Investment Income", base: baseNI * 1.5, bold: true }],
      },
      {
        name: "Lainnya",
        rev: "Est.",
        growth: "+5%",
        pct: 10,
        color: "#9A72E8",
        lines: [{ l: "Other Income", base: baseNI * 0.5, bold: true }],
      },
    ];
  } else if (
    sectorUpper.includes("mining") ||
    sectorUpper.includes("tambang") ||
    sectorUpper.includes("coal") ||
    sectorUpper.includes("nickel") ||
    sectorUpper.includes("cpo") ||
    sectorUpper.includes("agri")
  ) {
    segs = [
      {
        name: "Komoditas Utama",
        rev: "Est.",
        growth: "+12%",
        pct: 75,
        color: pickColor(asset.color, "#F0A030"),
        lines: [
          { l: "Volume Produksi", base: baseNI * 4, bold: true },
          { l: "Harga Rata-rata", base: baseNI * 1.5, sub: true },
        ],
      },
      {
        name: "Jasa & Pengolahan",
        rev: "Est.",
        growth: "+5%",
        pct: 15,
        color: "#22C97A",
        lines: [{ l: "Processing Revenue", base: baseNI * 0.8, bold: true }],
      },
      {
        name: "Lainnya",
        rev: "Est.",
        growth: "+3%",
        pct: 10,
        color: "#9A72E8",
        lines: [{ l: "Other Revenue", base: baseNI * 0.5, bold: true }],
      },
    ];
  } else if (
    sectorUpper.includes("health") ||
    sectorUpper.includes("farma") ||
    sectorUpper.includes("rs") ||
    sectorUpper.includes("klinik") ||
    sectorUpper.includes("diagnost")
  ) {
    segs = [
      {
        name: "Layanan Inti",
        rev: "Est.",
        growth: "+12%",
        pct: 70,
        color: pickColor(asset.color, "#E84A8C"),
        lines: [
          { l: "Core Revenue", base: baseNI * 3.8, bold: true },
          { l: "BPJS & Insurance", base: baseNI * 1.2, sub: true },
        ],
      },
      {
        name: "Layanan Premium",
        rev: "Est.",
        growth: "+15%",
        pct: 20,
        color: "#5FB88A",
        lines: [{ l: "Premium Service", base: baseNI * 1.0, bold: true }],
      },
      {
        name: "Pendapatan Lain",
        rev: "Est.",
        growth: "+5%",
        pct: 10,
        color: "#9A72E8",
        lines: [{ l: "Other", base: baseNI * 0.5, bold: true }],
      },
    ];
  } else if (
    sectorUpper.includes("properti") ||
    sectorUpper.includes("infrastruktur") ||
    sectorUpper.includes("konstruksi") ||
    sectorUpper.includes("toll") ||
    sectorUpper.includes("kawasan")
  ) {
    segs = [
      {
        name: "Revenue Utama",
        rev: "Est.",
        growth: "+10%",
        pct: 60,
        color: pickColor(asset.color, "#4AE8C8"),
        lines: [
          { l: "Project Revenue", base: baseNI * 3.2, bold: true },
          { l: "Recurring Income", base: baseNI * 0.8, sub: true },
        ],
      },
      {
        name: "Recurring Pendapatan",
        rev: "Est.",
        growth: "+8%",
        pct: 30,
        color: "#3A9EE8",
        lines: [{ l: "Mall & Hotel Income", base: baseNI * 1.5, bold: true }],
      },
      {
        name: "Lainnya",
        rev: "Est.",
        growth: "+3%",
        pct: 10,
        color: "#9A72E8",
        lines: [{ l: "Other", base: baseNI * 0.5, bold: true }],
      },
    ];
  } else {
    segs = [
      {
        name: "Produk & Layanan Utama",
        rev: "Est.",
        growth: "+10%",
        pct: 65,
        color: pickColor(asset.color, "#5FB88A"),
        lines: [
          { l: "Core Product Revenue", base: baseNI * 3.5, bold: true },
          { l: "Brand Revenue", base: baseNI * 0.8, sub: true },
        ],
      },
      {
        name: "Channel Distribusi",
        rev: "Est.",
        growth: "+12%",
        pct: 25,
        color: "#22C97A",
        lines: [{ l: "Distribution Revenue", base: baseNI * 1.2, bold: true }],
      },
      {
        name: "Lainnya",
        rev: "Est.",
        growth: "+5%",
        pct: 10,
        color: "#9A72E8",
        lines: [{ l: "Other Revenue", base: baseNI * 0.5, bold: true }],
      },
    ];
  }

  return { ks, is, segs: genSegs(segs) };
}

function buildIntlFallback(asset: ResearchAsset): ReportFinancials {
  const priceNum = parsePrice(asset.price) || 80;
  const baseNi = Math.max(1, priceNum / 5);
  const baseRev = Math.max(8, baseNi * 6);
  const eps = (baseNi / 10).toFixed(2);
  const mc = `USD ${(priceNum * 6).toFixed(0)} B`;
  const shares = `${(priceNum / 25).toFixed(2)} B`;
  const ks = genIntlKS(
    baseNi,
    eps,
    baseRev,
    mc,
    mc,
    shares,
    "100%",
    priceNum,
    8,
  );
  const is = genIntlIS(baseRev, baseNi);
  const segs = genIntlSegs([
    {
      n: "Core Business",
      r: `$${baseRev.toFixed(0)} B`,
      g: "+8%",
      p: 70,
      c: "#5FB88A",
    },
    {
      n: "Adjacency",
      r: `$${(baseRev * 0.3).toFixed(0)} B`,
      g: "+5%",
      p: 30,
      c: "#3A9EE8",
    },
  ]);
  return { ks, is, segs };
}

const ADMR_KS = genKS(1.2, 12.5, 2.8, 0.3, "58.6 T", 41.27, 33, 1420, 14);
const ADMR_IS = genIS(4.2, 14);
const ADMR_SEGS = genSegs([
  {
    name: "Coking Coal",
    rev: "14.2 T",
    growth: "+15%",
    pct: 62,
    color: "#E8884A",
    lines: [
      { l: "Volume Produksi", base: 2.1, bold: true },
      { l: "Harga Rata-rata", base: 1.2, sub: true },
    ],
  },
  {
    name: "Aluminium Smelter",
    rev: "5.5 T",
    growth: "+28%",
    pct: 24,
    color: "#3A9EE8",
    lines: [
      { l: "Produksi Aluminium", base: 1.0, bold: true },
      { l: "Premium", base: 0.35, sub: true },
    ],
  },
  {
    name: "Jasa Pelabuhan",
    rev: "2.0 T",
    growth: "+5%",
    pct: 9,
    color: "#22C97A",
    lines: [{ l: "Loading Service", base: 0.5, bold: true }],
  },
  {
    name: "Lainnya",
    rev: "1.1 T",
    growth: "+3%",
    pct: 5,
    color: "#9A72E8",
    lines: [{ l: "Lainnya", base: 0.28, bold: true }],
  },
]);

const EXCL_KS = genKS(0.85, 8.5, 3.2, 0.45, "24.5 T", 11.54, 34, 2100, 25);
const EXCL_IS = genIS(2.5, 25);
const EXCL_SEGS = genSegs([
  {
    name: "Mobile Data",
    rev: "24 T",
    growth: "+6%",
    pct: 62,
    color: "#9A72E8",
    lines: [
      { l: "Data Revenue", base: 5.2, bold: true },
      { l: "Data Volume (PB)", base: 2.8, sub: true },
    ],
  },
  {
    name: "Voice & SMS",
    rev: "5.5 T",
    growth: "-8%",
    pct: 14,
    color: "#F0A030",
    lines: [
      { l: "Voice", base: 0.95, bold: true },
      { l: "SMS", base: 0.45, sub: true },
    ],
  },
  {
    name: "Digital Services",
    rev: "5 T",
    growth: "+32%",
    pct: 13,
    color: "#5FB88A",
    lines: [
      { l: "Digital Content", base: 0.85, bold: true },
      { l: "Enterprise Digital", base: 0.42, sub: true },
    ],
  },
  {
    name: "Home Broadband (FBB)",
    rev: "4 T",
    growth: "+18%",
    pct: 11,
    color: "#22C97A",
    lines: [
      { l: "FBB Subscribers", base: 0.82, bold: true },
      { l: "Add-on", base: 0.18, sub: true },
    ],
  },
]);

const INCO_KS = genKS(0.9, 5.2, 3.0, 0.35, "36.5 T", 9.94, 21, 3680, 10);
const INCO_IS = genIS(3.0, 10);
const INCO_SEGS = genSegs([
  {
    name: "Nickel Matte",
    rev: "22 T",
    growth: "+2%",
    pct: 78,
    color: "#E8884A",
    lines: [
      { l: "Volume Produksi", base: 4.5, bold: true },
      { l: "Harga Rata-rata", base: 2.1, sub: true },
    ],
  },
  {
    name: "HPAL Products",
    rev: "4 T",
    growth: "+42%",
    pct: 14,
    color: "#22C97A",
    lines: [{ l: "Mixed Hydroxide", base: 0.85, bold: true }],
  },
  {
    name: "Trading & Jasa",
    rev: "2.2 T",
    growth: "+6%",
    pct: 8,
    color: "#3A9EE8",
    lines: [{ l: "Trading", base: 0.52, bold: true }],
  },
]);

const MDKA_KS = genKS(0.4, 18.5, 0, 0, "52 T", 24.1, 47, 2150, 22);
const MDKA_IS = genIS(3.5, 22);
const MDKA_SEGS = genSegs([
  {
    name: "Copper (Wetar, PANI)",
    rev: "18 T",
    growth: "+28%",
    pct: 52,
    color: "#E8884A",
    lines: [
      { l: "Cu Konsentrat", base: 3.8, bold: true },
      { l: "Harga USD/lb", base: 1.5, sub: true },
    ],
  },
  {
    name: "Gold",
    rev: "10 T",
    growth: "+22%",
    pct: 29,
    color: "#C8A84B",
    lines: [
      { l: "Gold Oz", base: 2.2, bold: true },
      { l: "Harga rata-rata", base: 0.8, sub: true },
    ],
  },
  {
    name: "Nickel (AIM, HPAL)",
    rev: "5.5 T",
    growth: "+15%",
    pct: 16,
    color: "#3A9EE8",
    lines: [{ l: "Nickel Products", base: 1.25, bold: true }],
  },
  {
    name: "Lainnya",
    rev: "1 T",
    growth: "+5%",
    pct: 3,
    color: "#9A72E8",
    lines: [{ l: "Lainnya", base: 0.24, bold: true }],
  },
]);

const PTBA_KS = genKS(1.2, -2.5, 9.5, 0.75, "36.9 T", 11.52, 34, 3200, -3);
const PTBA_IS = genIS(4.2, -3);
const PTBA_SEGS = genSegs([
  {
    name: "Batubara Domestik",
    rev: "24 T",
    growth: "-2%",
    pct: 63,
    color: "#F0A030",
    lines: [
      { l: "Volume DMO", base: 5.2, bold: true },
      { l: "Harga DMO", base: 1.8, sub: true },
    ],
  },
  {
    name: "Batubara Ekspor",
    rev: "10 T",
    growth: "-8%",
    pct: 26,
    color: "#E04848",
    lines: [
      { l: "Volume Ekspor", base: 2.4, bold: true },
      { l: "Harga Ekspor", base: 0.95, sub: true },
    ],
  },
  {
    name: "Energi & Properti",
    rev: "3 T",
    growth: "+5%",
    pct: 8,
    color: "#22C97A",
    lines: [{ l: "PLTU IPP", base: 0.72, bold: true }],
  },
  {
    name: "Jasa Angkutan",
    rev: "1 T",
    growth: "+3%",
    pct: 3,
    color: "#3A9EE8",
    lines: [{ l: "KAI Transport", base: 0.28, bold: true }],
  },
]);

const KLBF_KS = genKS(0.85, 6.5, 2.5, 0.55, "70.8 T", 46.88, 42, 1510, 9);
const KLBF_IS = genIS(2.4, 9);
const KLBF_SEGS = genSegs([
  {
    name: "Produk Obat Resep",
    rev: "9.5 T",
    growth: "+5%",
    pct: 32,
    color: "#E84A8C",
    lines: [
      { l: "Obat Resep", base: 2.05, bold: true },
      { l: "Branded Generic", base: 0.55, sub: true },
    ],
  },
  {
    name: "Produk Konsumen",
    rev: "8.5 T",
    growth: "+8%",
    pct: 29,
    color: "#22C97A",
    lines: [
      { l: "OTC & Food Suppl", base: 1.8, bold: true },
      { l: "Susu", base: 0.42, sub: true },
    ],
  },
  {
    name: "Nutraceutical",
    rev: "7 T",
    growth: "+12%",
    pct: 24,
    color: "#5FB88A",
    lines: [
      { l: "Susu Nutrisi", base: 1.5, bold: true },
      { l: "Vitamin", base: 0.32, sub: true },
    ],
  },
  {
    name: "Distribusi",
    rev: "4.5 T",
    growth: "+4%",
    pct: 15,
    color: "#9A72E8",
    lines: [{ l: "Distribusi Medis", base: 1.1, bold: true }],
  },
]);

const CPIN_KS = genKS(1.8, 8.2, 2.8, 0.4, "87 T", 16.4, 45, 5300, 10);
const CPIN_IS = genIS(6.5, 10);
const CPIN_SEGS = genSegs([
  {
    name: "Pakan Ternak",
    rev: "38 T",
    growth: "+9%",
    pct: 45,
    color: "#F0A030",
    lines: [
      { l: "Pakan Unggas", base: 8.0, bold: true },
      { l: "Pakan Ikan", base: 1.2, sub: true },
    ],
  },
  {
    name: "DOC & Ayam Peternak",
    rev: "21 T",
    growth: "+5%",
    pct: 25,
    color: "#8AE84A",
    lines: [
      { l: "DOC", base: 3.2, bold: true },
      { l: "Broiler Live", base: 1.8, sub: true },
    ],
  },
  {
    name: "Makanan Olahan",
    rev: "18 T",
    growth: "+15%",
    pct: 22,
    color: "#22C97A",
    lines: [
      { l: "Chicken Nugget, Sosis", base: 3.5, bold: true },
      { l: "Restoran Rep.", base: 0.55, sub: true },
    ],
  },
  {
    name: "Lainnya",
    rev: "7 T",
    growth: "+4%",
    pct: 8,
    color: "#9A72E8",
    lines: [{ l: "Produk Pendukung", base: 1.65, bold: true }],
  },
]);

const PGAS_KS = genKS(1.1, 3.5, 6.2, 0.65, "39.6 T", 24.24, 43, 1635, 4);
const PGAS_IS = genIS(4.5, 4);
const PGAS_SEGS = genSegs([
  {
    name: "Distribusi Gas",
    rev: "42 T",
    growth: "+5%",
    pct: 72,
    color: "#F0A030",
    lines: [
      { l: "Gas Industri", base: 8.5, bold: true },
      { l: "Gas Komersial", base: 1.2, sub: true },
    ],
  },
  {
    name: "Transmisi",
    rev: "8 T",
    growth: "+2%",
    pct: 14,
    color: "#3A9EE8",
    lines: [{ l: "Pipa Transmisi", base: 1.8, bold: true }],
  },
  {
    name: "Upstream & Minyak",
    rev: "5 T",
    growth: "+1%",
    pct: 9,
    color: "#E04848",
    lines: [{ l: "Upstream Saka", base: 1.2, bold: true }],
  },
  {
    name: "Lainnya",
    rev: "3 T",
    growth: "+8%",
    pct: 5,
    color: "#9A72E8",
    lines: [{ l: "Jasa LNG & Trading", base: 0.72, bold: true }],
  },
]);

const SMGR_KS = genKS(0.55, -5.5, 4.2, 0.5, "25.8 T", 5.93, 49, 4350, -5);
const SMGR_IS = genIS(3.8, -5);
const SMGR_SEGS = genSegs([
  {
    name: "Semen Domestik",
    rev: "32 T",
    growth: "-3%",
    pct: 80,
    color: "#4AE8C8",
    lines: [
      { l: "Semen Kantong", base: 5.2, bold: true },
      { l: "Semen Curah", base: 2.8, sub: true },
    ],
  },
  {
    name: "Semen Ekspor",
    rev: "4 T",
    growth: "-12%",
    pct: 10,
    color: "#F0A030",
    lines: [{ l: "Ekspor Clinker", base: 0.92, bold: true }],
  },
  {
    name: "Produk Turunan",
    rev: "3 T",
    growth: "+5%",
    pct: 8,
    color: "#22C97A",
    lines: [{ l: "Beton Siap Pakai", base: 0.68, bold: true }],
  },
  {
    name: "Lainnya",
    rev: "1 T",
    growth: "+4%",
    pct: 2,
    color: "#9A72E8",
    lines: [{ l: "Jasa & Logistik", base: 0.22, bold: true }],
  },
]);

const UNVR_KS = genKS(1.5, -12.5, 8.5, 0.85, "99.2 T", 38.15, 15, 2600, -10);
const UNVR_IS = genIS(10.0, -10);
const UNVR_SEGS = genSegs([
  {
    name: "Home & Personal Care",
    rev: "24 T",
    growth: "-8%",
    pct: 57,
    color: "#22C97A",
    lines: [
      { l: "Body Care", base: 3.8, bold: true },
      { l: "Laundry", base: 1.8, sub: true },
    ],
  },
  {
    name: "Foods & Refreshment",
    rev: "15 T",
    growth: "-3%",
    pct: 36,
    color: "#F0A030",
    lines: [
      { l: "Teh & Es Krim", base: 2.5, bold: true },
      { l: "Foods", base: 0.85, sub: true },
    ],
  },
  {
    name: "Ice Cream",
    rev: "2 T",
    growth: "+2%",
    pct: 5,
    color: "#9A72E8",
    lines: [{ l: "Walls, Magnum", base: 0.48, bold: true }],
  },
  {
    name: "Lainnya",
    rev: "1 T",
    growth: "-4%",
    pct: 2,
    color: "#E04848",
    lines: [{ l: "Other", base: 0.25, bold: true }],
  },
]);

const TPIA_KS = genKS(0.65, 8.5, 0, 0, "155 T", 17.54, 31, 8450, 12);
const TPIA_IS = genIS(5.5, 12);
const TPIA_SEGS = genSegs([
  {
    name: "Olefins (Ethylene, Propylene)",
    rev: "28 T",
    growth: "+12%",
    pct: 50,
    color: "#F0A030",
    lines: [
      { l: "Ethylene", base: 3.2, bold: true },
      { l: "Propylene", base: 2.5, sub: true },
    ],
  },
  {
    name: "Polyolefins (PE, PP)",
    rev: "18 T",
    growth: "+8%",
    pct: 32,
    color: "#3A9EE8",
    lines: [
      { l: "Polyethylene", base: 2.2, bold: true },
      { l: "Polypropylene", base: 1.5, sub: true },
    ],
  },
  {
    name: "Styrene Monomer",
    rev: "6 T",
    growth: "+15%",
    pct: 11,
    color: "#22C97A",
    lines: [{ l: "Styrene", base: 1.38, bold: true }],
  },
  {
    name: "Lainnya",
    rev: "4 T",
    growth: "+5%",
    pct: 7,
    color: "#9A72E8",
    lines: [{ l: "Butadiene & Others", base: 0.92, bold: true }],
  },
]);

const SIDO_KS = genKS(0.35, 6.2, 6.5, 0.8, "22.8 T", 30.0, 19, 760, 8);
const SIDO_IS = genIS(1.0, 8);
const SIDO_SEGS = genSegs([
  {
    name: "Jamu & Suplemen",
    rev: "2.8 T",
    growth: "+7%",
    pct: 60,
    color: "#5FB88A",
    lines: [
      { l: "Tolak Angin", base: 0.52, bold: true },
      { l: "Kuku Bima", base: 0.28, sub: true },
    ],
  },
  {
    name: "Makanan & Minuman",
    rev: "1.2 T",
    growth: "+4%",
    pct: 26,
    color: "#F0A030",
    lines: [
      { l: "Kopi Herbal", base: 0.25, bold: true },
      { l: "Permen", base: 0.12, sub: true },
    ],
  },
  {
    name: "Farmasi",
    rev: "0.5 T",
    growth: "+9%",
    pct: 11,
    color: "#E84A8C",
    lines: [{ l: "OTC", base: 0.11, bold: true }],
  },
  {
    name: "Ekspor",
    rev: "0.15 T",
    growth: "+28%",
    pct: 3,
    color: "#3A9EE8",
    lines: [{ l: "Ekspor ASEAN", base: 0.035, bold: true }],
  },
]);

const AADI_KS = genKS(2.1, 4.5, 11.5, 0.65, "52 T", 7.77, 22, 6700, 6);
const AADI_IS = genIS(6.8, 6);
const AADI_SEGS = genSegs([
  {
    name: "Batubara Thermal",
    rev: "42 T",
    growth: "+3%",
    pct: 85,
    color: "#F0A030",
    lines: [
      { l: "Volume Produksi", base: 9.0, bold: true },
      { l: "Harga Rata-rata", base: 3.2, sub: true },
    ],
  },
  {
    name: "Mining Services",
    rev: "5 T",
    growth: "+8%",
    pct: 10,
    color: "#3A9EE8",
    lines: [{ l: "Kontrak Mining", base: 1.18, bold: true }],
  },
  {
    name: "Lainnya",
    rev: "2.5 T",
    growth: "+5%",
    pct: 5,
    color: "#22C97A",
    lines: [{ l: "Logistik & Pelabuhan", base: 0.58, bold: true }],
  },
]);

const AALI_KS = genKS(0.45, 15.5, 4.8, 0.4, "14.8 T", 1.93, 21, 7650, 18);
const AALI_IS = genIS(2.0, 18);
const AALI_SEGS = genSegs([
  {
    name: "CPO & Turunan",
    rev: "16 T",
    growth: "+18%",
    pct: 82,
    color: "#8AE84A",
    lines: [
      { l: "CPO Dijual", base: 3.2, bold: true },
      { l: "Palm Kernel", base: 0.5, sub: true },
    ],
  },
  {
    name: "Biji Sawit (Bibit)",
    rev: "2 T",
    growth: "+5%",
    pct: 10,
    color: "#22C97A",
    lines: [{ l: "Bibit Sawit", base: 0.45, bold: true }],
  },
  {
    name: "Trading & Refining",
    rev: "1 T",
    growth: "+3%",
    pct: 5,
    color: "#F0A030",
    lines: [{ l: "Trading", base: 0.25, bold: true }],
  },
  {
    name: "Lainnya",
    rev: "0.5 T",
    growth: "+2%",
    pct: 3,
    color: "#9A72E8",
    lines: [{ l: "Produk Sampingan", base: 0.12, bold: true }],
  },
]);

const LSIP_KS = genKS(0.15, 12.8, 5.5, 0.5, "7.8 T", 6.83, 40, 1150, 15);
const LSIP_IS = genIS(1.3, 15);
const LSIP_SEGS = genSegs([
  {
    name: "CPO",
    rev: "4.5 T",
    growth: "+14%",
    pct: 75,
    color: "#8AE84A",
    lines: [{ l: "CPO Dijual", base: 0.95, bold: true }],
  },
  {
    name: "Karet",
    rev: "0.8 T",
    growth: "-3%",
    pct: 13,
    color: "#E04848",
    lines: [{ l: "Lateks", base: 0.18, bold: true }],
  },
  {
    name: "Biji Kakao & Teh",
    rev: "0.4 T",
    growth: "+5%",
    pct: 7,
    color: "#C8A84B",
    lines: [{ l: "Kakao", base: 0.09, bold: true }],
  },
  {
    name: "Lainnya",
    rev: "0.3 T",
    growth: "+2%",
    pct: 5,
    color: "#9A72E8",
    lines: [{ l: "Nursery & Lainnya", base: 0.07, bold: true }],
  },
]);

const HRUM_KS = genKS(0.45, 8.5, 3.5, 0.35, "18.5 T", 7.56, 23, 1450, 12);
const HRUM_IS = genIS(2.2, 12);
const HRUM_SEGS = genSegs([
  {
    name: "Nickel (Infei, WMI)",
    rev: "12 T",
    growth: "+25%",
    pct: 55,
    color: "#E8884A",
    lines: [
      { l: "Nickel Ore", base: 2.2, bold: true },
      { l: "NPI", base: 0.65, sub: true },
    ],
  },
  {
    name: "Batubara Thermal",
    rev: "8 T",
    growth: "-5%",
    pct: 36,
    color: "#F0A030",
    lines: [{ l: "Coal Production", base: 1.9, bold: true }],
  },
  {
    name: "Jasa Angkutan Laut",
    rev: "1.5 T",
    growth: "+8%",
    pct: 7,
    color: "#3A9EE8",
    lines: [{ l: "Shipping", base: 0.34, bold: true }],
  },
  {
    name: "Lainnya",
    rev: "0.5 T",
    growth: "+3%",
    pct: 2,
    color: "#9A72E8",
    lines: [{ l: "Lainnya", base: 0.12, bold: true }],
  },
]);

const ANTM_KS = genKS(0.82, 6.5, 3.8, 0.45, "41 T", 24.03, 35, 1720, 11);
const ANTM_IS = genIS(3.2, 11);
const ANTM_SEGS = genSegs([
  {
    name: "Emas & Logam Mulia",
    rev: "22 T",
    growth: "+9%",
    pct: 61,
    color: "#C8A84B",
    lines: [
      { l: "Gold Produk", base: 4.5, bold: true },
      { l: "Silver", base: 0.4, sub: true },
    ],
  },
  {
    name: "Nikel (Feronikel)",
    rev: "11 T",
    growth: "+5%",
    pct: 31,
    color: "#E8884A",
    lines: [
      { l: "Feronikel", base: 2.4, bold: true },
      { l: "Bijih Nikel", base: 0.2, sub: true },
    ],
  },
  {
    name: "Bauksit & Alumina",
    rev: "2.5 T",
    growth: "+15%",
    pct: 7,
    color: "#3A9EE8",
    lines: [{ l: "Bauksit", base: 0.58, bold: true }],
  },
  {
    name: "Lainnya",
    rev: "0.5 T",
    growth: "+3%",
    pct: 1,
    color: "#9A72E8",
    lines: [{ l: "Lainnya", base: 0.11, bold: true }],
  },
]);

const AAPL_KS: KsData = {
  netIncome: [
    qRow("Q1 FY26", "36.3", "+11%", true),
    qRow("Q2 FY26", "28.1", "+6%", true),
    qRow("Q3 FY26", "24.5", "+4%", true),
    qRow("Q4 FY26", "22.0", "+2%", true),
    qRow("TTM", "110.9", "+6%", true, true),
    qRow("FY 2025", "101.0", "+5%", true),
    { p: "FY 2026E", v: "119.8", g: "+8.0%", pos: true, bold: true, fc: true },
  ],
  eps: [
    qRow("Q1 FY26", "2.40", "+13%", true),
    qRow("Q2 FY26", "1.85", "+8%", true),
    qRow("Q3 FY26", "1.62", "+6%", true),
    qRow("Q4 FY26", "1.48", "+4%", true),
  ],
  revenue: [
    qRow("Q1 FY26", "124.3", "+4%", true),
    qRow("Q2 FY26", "95.4", "+5%", true),
    qRow("Q3 FY26", "85.8", "+4%", true),
    qRow("Q4 FY26", "94.9", "+6%", true),
    qRow("TTM", "400.4", "+5%", true, true),
    { p: "FY 2026E", v: "424.4", g: "+6.0%", pos: true, bold: true, fc: true },
  ],
  extra: {
    mktCap: "$3.55 T",
    ev: "$3.58 T",
    shares: "15.11 B",
    ff: "99.9%",
    peTTM: "32.1x",
    pe26: "29.7x",
  },
};
const AAPL_IS: IsData = {
  cols: [
    "FY 2026E",
    "Q1 FY26",
    "Q4 FY25",
    "Q3 FY25",
    "Q2 FY25",
    "Q1 FY25",
    "Q4 FY24",
  ],
  rows: [
    {
      l: "Revenue",
      v: ["424.4", "124.3", "94.9", "85.8", "95.4", "119.6", "94.9"],
      bold: true,
      fc: true,
    },
    {
      l: "Cost of Revenue",
      v: [
        "(234.0)",
        "(68.4)",
        "(52.2)",
        "(47.2)",
        "(52.5)",
        "(65.8)",
        "(52.2)",
      ],
      neg: true,
      sub: true,
      fc: true,
    },
    {
      l: "Gross Profit",
      v: ["190.4", "55.9", "42.7", "38.6", "42.9", "53.8", "42.7"],
      bold: true,
      hl: true,
      fc: true,
    },
    {
      l: "R&D",
      v: ["(33.5)", "(8.5)", "(8.2)", "(8.0)", "(7.8)", "(7.6)", "(7.3)"],
      neg: true,
      sub: true,
      fc: true,
    },
    {
      l: "SG&A",
      v: ["(26.5)", "(7.2)", "(6.5)", "(6.0)", "(6.3)", "(7.0)", "(6.5)"],
      neg: true,
      sub: true,
      fc: true,
    },
    {
      l: "Operating Income",
      v: ["130.4", "40.2", "28.0", "24.6", "28.8", "39.2", "29.0"],
      bold: true,
      fc: true,
    },
    {
      l: "Income Tax",
      v: ["(18.6)", "(5.5)", "(4.0)", "(3.3)", "(4.0)", "(5.6)", "(4.0)"],
      neg: true,
      sub: true,
      fc: true,
    },
    {
      l: "Net Income",
      v: ["119.8", "36.3", "22.0", "24.5", "28.1", "33.9", "25.0"],
      bold: true,
      hl: true,
      fc: true,
    },
  ],
};
const AAPL_SEGS: SegItem[] = [
  {
    name: "iPhone",
    rev: "$200 B",
    growth: "+3%",
    pct: 52,
    color: "#3A9EE8",
    rows: [
      {
        l: "iPhone Revenue",
        v: ["69.1 B", "45.2 B", "39.3 B", "46.2 B", "69.7 B", "46.2 B"],
        bold: true,
      },
      {
        l: "Volume Delivered",
        v: ["82 M", "54 M", "46 M", "54 M", "83 M", "55 M"],
        sub: true,
      },
    ],
  },
  {
    name: "Services",
    rev: "$105 B",
    growth: "+14%",
    pct: 27,
    color: "#22C97A",
    rows: [
      {
        l: "App Store & Search",
        v: ["13.5 B", "12.9 B", "12.4 B", "12.8 B", "11.8 B", "11.3 B"],
        bold: true,
      },
      {
        l: "iCloud, Apple TV+, Music",
        v: ["12.6 B", "12.0 B", "11.4 B", "11.8 B", "11.1 B", "10.6 B"],
        sub: true,
      },
    ],
  },
  {
    name: "Wearables & Home",
    rev: "$42 B",
    growth: "+6%",
    pct: 11,
    color: "#9A72E8",
    rows: [
      {
        l: "AirPods, Watch, HomePod",
        v: ["12.2 B", "9.0 B", "8.1 B", "9.6 B", "11.6 B", "9.0 B"],
        bold: true,
      },
    ],
  },
  {
    name: "Mac",
    rev: "$32 B",
    growth: "+7%",
    pct: 8,
    color: "#F0A030",
    rows: [
      {
        l: "Mac Revenue",
        v: ["9.5 B", "7.4 B", "7.0 B", "7.5 B", "9.0 B", "7.7 B"],
        bold: true,
      },
    ],
  },
  {
    name: "iPad",
    rev: "$28 B",
    growth: "+5%",
    pct: 2,
    color: "#E84A8C",
    rows: [
      {
        l: "iPad Revenue",
        v: ["8.0 B", "6.7 B", "6.0 B", "6.5 B", "7.5 B", "7.0 B"],
        bold: true,
      },
    ],
  },
];

const MSFT_KS: KsData = {
  netIncome: [
    qRow("Q1 FY26", "28.5", "+12%", true),
    qRow("Q2 FY26", "26.8", "+10%", true),
    qRow("Q3 FY26", "25.2", "+11%", true),
    qRow("Q4 FY26", "24.5", "+9%", true),
    qRow("TTM", "105.0", "+10%", true, true),
    { p: "FY 2026E", v: "116.5", g: "+11.0%", pos: true, bold: true, fc: true },
  ],
  eps: [
    qRow("Q1 FY26", "3.82", "+13%", true),
    qRow("Q2 FY26", "3.60", "+11%", true),
    qRow("Q3 FY26", "3.38", "+12%", true),
  ],
  revenue: [
    qRow("Q1 FY26", "72.5", "+14%", true),
    qRow("Q2 FY26", "69.6", "+13%", true),
    qRow("Q3 FY26", "65.2", "+12%", true),
    qRow("Q4 FY26", "62.8", "+11%", true),
    qRow("TTM", "270.1", "+12%", true, true),
    { p: "FY 2026E", v: "302.5", g: "+12.0%", pos: true, bold: true, fc: true },
  ],
  extra: {
    mktCap: "$3.10 T",
    ev: "$3.05 T",
    shares: "7.45 B",
    ff: "99.9%",
    peTTM: "29.5x",
    pe26: "26.5x",
  },
};
const MSFT_IS: IsData = {
  cols: [
    "FY 2026E",
    "Q1 FY26",
    "Q4 FY25",
    "Q3 FY25",
    "Q2 FY25",
    "Q1 FY25",
    "Q4 FY24",
  ],
  rows: [
    {
      l: "Revenue",
      v: ["302.5", "72.5", "62.8", "65.2", "69.6", "65.6", "64.7"],
      bold: true,
      fc: true,
    },
    {
      l: "Cost of Revenue",
      v: ["(91.0)", "(22.1)", "(19.5)", "(20.0)", "(21.0)", "(20.0)", "(19.8)"],
      neg: true,
      sub: true,
      fc: true,
    },
    {
      l: "Gross Profit",
      v: ["211.5", "50.4", "43.3", "45.2", "48.6", "45.6", "44.9"],
      bold: true,
      hl: true,
      fc: true,
    },
    {
      l: "R&D",
      v: ["(33.0)", "(8.2)", "(7.8)", "(7.5)", "(7.9)", "(7.5)", "(7.4)"],
      neg: true,
      sub: true,
      fc: true,
    },
    {
      l: "SG&A",
      v: ["(26.5)", "(6.5)", "(6.2)", "(6.0)", "(6.3)", "(6.1)", "(6.0)"],
      neg: true,
      sub: true,
      fc: true,
    },
    {
      l: "Operating Income",
      v: ["152.0", "35.7", "29.3", "31.7", "34.4", "32.0", "31.5"],
      bold: true,
      fc: true,
    },
    {
      l: "Income Tax",
      v: ["(22.5)", "(5.4)", "(4.4)", "(4.7)", "(5.2)", "(4.9)", "(4.7)"],
      neg: true,
      sub: true,
      fc: true,
    },
    {
      l: "Net Income",
      v: ["116.5", "28.5", "24.5", "25.2", "26.8", "24.7", "24.1"],
      bold: true,
      hl: true,
      fc: true,
    },
  ],
};
const MSFT_SEGS: SegItem[] = [
  {
    name: "Productivity & Business",
    rev: "$90 B",
    growth: "+14%",
    pct: 33,
    color: "#3A9EE8",
    rows: [
      {
        l: "Office 365 Commercial",
        v: ["15.2 B", "14.2 B", "13.8 B", "14.5 B", "13.3 B", "13.0 B"],
        bold: true,
      },
      {
        l: "LinkedIn",
        v: ["5.0 B", "4.7 B", "4.5 B", "4.8 B", "4.4 B", "4.3 B"],
        sub: true,
      },
      {
        l: "Dynamics 365",
        v: ["2.5 B", "2.3 B", "2.2 B", "2.4 B", "2.2 B", "2.1 B"],
        sub: true,
      },
    ],
  },
  {
    name: "Intelligent Cloud (Azure)",
    rev: "$125 B",
    growth: "+22%",
    pct: 46,
    color: "#5FB88A",
    rows: [
      {
        l: "Azure & Cloud Services",
        v: ["28.5 B", "26.0 B", "24.8 B", "27.3 B", "23.5 B", "22.9 B"],
        bold: true,
      },
      {
        l: "Server Products",
        v: ["5.5 B", "5.1 B", "4.9 B", "5.2 B", "4.8 B", "4.7 B"],
        sub: true,
      },
    ],
  },
  {
    name: "More Personal Computing",
    rev: "$55 B",
    growth: "+2%",
    pct: 20,
    color: "#9A72E8",
    rows: [
      {
        l: "Windows OEM",
        v: ["4.2 B", "3.9 B", "3.8 B", "4.0 B", "4.1 B", "4.0 B"],
        bold: true,
      },
      {
        l: "Gaming (Xbox)",
        v: ["6.8 B", "5.5 B", "5.2 B", "6.2 B", "7.0 B", "5.6 B"],
        sub: true,
      },
      {
        l: "Search & Devices",
        v: ["4.5 B", "4.2 B", "4.0 B", "4.3 B", "4.1 B", "4.0 B"],
        sub: true,
      },
    ],
  },
];

const NVDA_KS: KsData = {
  netIncome: [
    qRow("Q1 FY27", "29.5", "+42%", true),
    qRow("Q2 FY27", "24.8", "+32%", true),
    qRow("Q3 FY27", "22.1", "+28%", true),
    qRow("Q4 FY27", "19.5", "+22%", true),
    qRow("TTM", "95.9", "+31%", true, true),
    { p: "FY 2027E", v: "125.5", g: "+30.9%", pos: true, bold: true, fc: true },
  ],
  eps: [
    qRow("Q1 FY27", "1.21", "+45%", true),
    qRow("Q2 FY27", "1.02", "+35%", true),
    qRow("Q3 FY27", "0.91", "+30%", true),
  ],
  revenue: [
    qRow("Q1 FY27", "58.5", "+40%", true),
    qRow("Q2 FY27", "50.2", "+38%", true),
    qRow("Q3 FY27", "45.8", "+34%", true),
    qRow("Q4 FY27", "42.5", "+28%", true),
    qRow("TTM", "197.0", "+35%", true, true),
    { p: "FY 2027E", v: "258.6", g: "+31.3%", pos: true, bold: true, fc: true },
  ],
  extra: {
    mktCap: "$3.45 T",
    ev: "$3.42 T",
    shares: "24.50 B",
    ff: "96%",
    peTTM: "36.0x",
    pe26: "27.5x",
  },
};
const NVDA_IS: IsData = {
  cols: [
    "FY 2027E",
    "Q1 FY27",
    "Q4 FY26",
    "Q3 FY26",
    "Q2 FY26",
    "Q1 FY26",
    "Q4 FY25",
  ],
  rows: [
    {
      l: "Revenue",
      v: ["258.6", "58.5", "42.5", "45.8", "50.2", "44.1", "39.3"],
      bold: true,
      fc: true,
    },
    {
      l: "Cost of Revenue",
      v: ["(67.0)", "(15.3)", "(11.2)", "(12.0)", "(13.2)", "(11.5)", "(10.4)"],
      neg: true,
      sub: true,
      fc: true,
    },
    {
      l: "Gross Profit",
      v: ["191.6", "43.2", "31.3", "33.8", "37.0", "32.6", "28.9"],
      bold: true,
      hl: true,
      fc: true,
    },
    {
      l: "R&D",
      v: ["(22.5)", "(5.2)", "(4.6)", "(4.4)", "(4.8)", "(4.3)", "(4.0)"],
      neg: true,
      sub: true,
      fc: true,
    },
    {
      l: "SG&A",
      v: ["(8.0)", "(1.8)", "(1.6)", "(1.5)", "(1.7)", "(1.5)", "(1.4)"],
      neg: true,
      sub: true,
      fc: true,
    },
    {
      l: "Operating Income",
      v: ["161.0", "36.2", "25.1", "27.9", "30.5", "26.8", "23.5"],
      bold: true,
      fc: true,
    },
    {
      l: "Income Tax",
      v: ["(24.5)", "(5.5)", "(3.8)", "(4.3)", "(4.7)", "(4.1)", "(3.6)"],
      neg: true,
      sub: true,
      fc: true,
    },
    {
      l: "Net Income",
      v: ["125.5", "29.5", "19.5", "22.1", "24.8", "21.3", "19.1"],
      bold: true,
      hl: true,
      fc: true,
    },
  ],
};
const NVDA_SEGS: SegItem[] = [
  {
    name: "Data Center (AI)",
    rev: "$170 B",
    growth: "+45%",
    pct: 87,
    color: "#5FB88A",
    rows: [
      {
        l: "Hopper & Blackwell GPU",
        v: ["48.5 B", "35.2 B", "38.5 B", "42.0 B", "37.0 B", "32.5 B"],
        bold: true,
      },
      {
        l: "Networking (Mellanox)",
        v: ["3.8 B", "3.2 B", "3.4 B", "3.6 B", "3.2 B", "2.8 B"],
        sub: true,
      },
    ],
  },
  {
    name: "Gaming",
    rev: "$12 B",
    growth: "+8%",
    pct: 6,
    color: "#9A72E8",
    rows: [
      {
        l: "GeForce RTX GPU",
        v: ["3.2 B", "2.8 B", "3.0 B", "3.1 B", "2.9 B", "2.7 B"],
        bold: true,
      },
    ],
  },
  {
    name: "Professional Visualization",
    rev: "$2 B",
    growth: "+12%",
    pct: 1,
    color: "#3A9EE8",
    rows: [
      {
        l: "Quadro/Omniverse",
        v: ["0.58 B", "0.48 B", "0.52 B", "0.55 B", "0.48 B", "0.45 B"],
        bold: true,
      },
    ],
  },
  {
    name: "Automotive",
    rev: "$2 B",
    growth: "+55%",
    pct: 1,
    color: "#F0A030",
    rows: [
      {
        l: "DRIVE Platform",
        v: ["0.68 B", "0.50 B", "0.55 B", "0.62 B", "0.45 B", "0.38 B"],
        bold: true,
      },
    ],
  },
  {
    name: "OEM & Other",
    rev: "$11 B",
    growth: "+3%",
    pct: 5,
    color: "#E84A8C",
    rows: [
      {
        l: "OEM & IP",
        v: ["2.5 B", "2.3 B", "2.4 B", "2.5 B", "2.3 B", "2.2 B"],
        bold: true,
      },
    ],
  },
];

const GOOGL_KS: KsData = {
  netIncome: [
    qRow("Q1 2026", "28.0", "+14%", true),
    qRow("Q4 2025", "26.5", "+12%", true),
    qRow("Q3 2025", "25.2", "+11%", true),
    qRow("Q2 2025", "23.8", "+10%", true),
    qRow("TTM", "103.5", "+12%", true, true),
  ],
  eps: [
    qRow("Q1 2026", "2.28", "+16%", true),
    qRow("Q4 2025", "2.15", "+14%", true),
    qRow("Q3 2025", "2.05", "+13%", true),
  ],
  revenue: [
    qRow("Q1 2026", "95.2", "+13%", true),
    qRow("Q4 2025", "92.8", "+12%", true),
    qRow("Q3 2025", "87.5", "+11%", true),
    qRow("Q2 2025", "83.2", "+10%", true),
    qRow("TTM", "358.7", "+12%", true, true),
  ],
  extra: {
    mktCap: "$2.25 T",
    ev: "$2.20 T",
    shares: "12.28 B",
    ff: "90%",
    peTTM: "22.5x",
    pe26: "20.1x",
  },
};
const GOOGL_IS = genIS(92, 12);
const GOOGL_SEGS: SegItem[] = [
  {
    name: "Google Search & Other",
    rev: "$200 B",
    growth: "+11%",
    pct: 56,
    color: "#3A9EE8",
    rows: [
      {
        l: "Search Ads",
        v: ["52 B", "51 B", "48 B", "49 B", "47 B", "45 B"],
        bold: true,
      },
      {
        l: "Other Google Properties",
        v: ["2 B", "2 B", "2 B", "2 B", "2 B", "2 B"],
        sub: true,
      },
    ],
  },
  {
    name: "YouTube Ads",
    rev: "$42 B",
    growth: "+15%",
    pct: 12,
    color: "#E04848",
    rows: [
      {
        l: "YouTube Ads",
        v: ["11 B", "10.5 B", "10 B", "10.2 B", "9.5 B", "9 B"],
        bold: true,
      },
    ],
  },
  {
    name: "Google Cloud",
    rev: "$55 B",
    growth: "+32%",
    pct: 15,
    color: "#22C97A",
    rows: [
      {
        l: "GCP & Workspace",
        v: ["15 B", "13.5 B", "13 B", "13.5 B", "11 B", "10 B"],
        bold: true,
      },
    ],
  },
  {
    name: "Google Subscriptions",
    rev: "$45 B",
    growth: "+18%",
    pct: 13,
    color: "#9A72E8",
    rows: [
      {
        l: "YouTube Premium, Google One",
        v: ["11.5 B", "11 B", "10.5 B", "11 B", "10 B", "9.5 B"],
        bold: true,
      },
    ],
  },
  {
    name: "Other Bets",
    rev: "$16 B",
    growth: "+25%",
    pct: 4,
    color: "#F0A030",
    rows: [
      {
        l: "Waymo, Verily, etc.",
        v: ["4 B", "3.8 B", "3.6 B", "3.8 B", "3.3 B", "3 B"],
        bold: true,
      },
    ],
  },
];

const TSM_KS: KsData = {
  netIncome: [
    qRow("Q1 2026", "10.8", "+25%", true),
    qRow("Q4 2025", "10.2", "+22%", true),
    qRow("Q3 2025", "9.5", "+20%", true),
    qRow("Q2 2025", "8.8", "+18%", true),
    qRow("TTM", "39.3", "+21%", true, true),
  ],
  eps: [
    qRow("Q1 2026", "2.08", "+26%", true),
    qRow("Q4 2025", "1.97", "+23%", true),
    qRow("Q3 2025", "1.83", "+21%", true),
  ],
  revenue: [
    qRow("Q1 2026", "26.5", "+25%", true),
    qRow("Q4 2025", "25.2", "+23%", true),
    qRow("Q3 2025", "23.5", "+20%", true),
    qRow("Q2 2025", "22.0", "+18%", true),
    qRow("TTM", "97.2", "+22%", true, true),
  ],
  extra: {
    mktCap: "$1.05 T",
    ev: "$1.03 T",
    shares: "5.19 B",
    ff: "100%",
    peTTM: "27.0x",
    pe26: "22.5x",
  },
};
const TSM_IS = genIS(25, 20);
const TSM_SEGS = genSegs([
  {
    name: "5nm & Below (AI, Mobile)",
    rev: "$52 B",
    growth: "+40%",
    pct: 53,
    color: "#5FB88A",
    lines: [
      { l: "5nm/3nm Wafer", base: 13.5, bold: true },
      { l: "Advanced Packaging", base: 1.2, sub: true },
    ],
  },
  {
    name: "7nm",
    rev: "$18 B",
    growth: "+12%",
    pct: 18,
    color: "#3A9EE8",
    lines: [{ l: "7nm Wafer", base: 4.5, bold: true }],
  },
  {
    name: "16nm & Below",
    rev: "$16 B",
    growth: "+8%",
    pct: 16,
    color: "#22C97A",
    lines: [{ l: "Mature Nodes", base: 4.0, bold: true }],
  },
  {
    name: "28nm+",
    rev: "$13 B",
    growth: "-5%",
    pct: 13,
    color: "#F0A030",
    lines: [{ l: "Legacy Nodes", base: 3.25, bold: true }],
  },
]);

const INDON_KS: KsData = {
  netIncome: [
    qRow("Apr 2026", "5.85%", "+10 bps", false),
    qRow("Q4 2025", "5.75%", "+5 bps", false),
    qRow("Q3 2025", "5.70%", "-5 bps", true),
    qRow("Q2 2025", "5.80%", "+15 bps", false),
    qRow("Q1 2025", "5.55%", "-25 bps", true, true),
    divRow("Karakteristik Instrumen"),
    qRow("Coupon", "5.65%", null, null),
    qRow("Maturity", "Des 2034", null, null),
    qRow("Duration", "7.8 thn", null, null),
    qRow("Rating", "Baa2/BBB", null, null),
    qRow("Currency", "USD", null, null),
  ],
  eps: [
    qRow("YTM", "5.85%", "Current", true),
    qRow("Coupon", "5.65%", "Fixed", true),
    qRow("Current Yield", "5.64%", "Market", true),
    qRow("Yield/Duration", "0.75", null, null),
  ],
  revenue: [
    qRow("Apr 2026", "100.25", "+0.30%", true),
    qRow("Q4 2025", "99.95", "-0.10%", false),
    qRow("Q3 2025", "100.05", "+0.20%", true),
    qRow("Q2 2025", "99.85", "-0.65%", false),
    qRow("Q1 2025", "100.50", "+0.20%", true),
  ],
  extra: {
    mktCap: "USD 1.5 B",
    ev: "Nominal",
    shares: "Sovereign",
    ff: "100%",
  },
};
const INDON_IS: IsData = {
  cols: ["Apr 2026", "Q4 2025", "Q3 2025", "Q2 2025", "Q1 2025", "Q4 2024"],
  rows: [
    {
      l: "Harga Pasar (bid)",
      v: ["100.25", "99.95", "100.05", "99.85", "100.50", "100.30"],
      bold: true,
    },
    {
      l: "Yield to Maturity",
      v: ["5.85%", "5.75%", "5.70%", "5.80%", "5.55%", "5.60%"],
      bold: true,
      hl: true,
    },
    {
      l: "Current Yield",
      v: ["5.64%", "5.65%", "5.65%", "5.66%", "5.62%", "5.63%"],
      sub: true,
    },
    {
      l: "Kupon Accrued (USD)",
      v: ["1.82", "0.91", "2.75", "1.85", "0.92", "2.80"],
      sub: true,
    },
    {
      l: "Spread vs UST 10Y",
      v: [
        "+165 bps",
        "+155 bps",
        "+150 bps",
        "+160 bps",
        "+135 bps",
        "+140 bps",
      ],
      bold: true,
    },
    {
      l: "FX Gain/Loss (IDR)",
      v: ["+1.2%", "+0.8%", "-0.3%", "+1.5%", "+0.4%", "-0.8%"],
      hl: true,
    },
    {
      l: "Total Return (IDR est.)",
      v: ["+7.1%", "+6.6%", "+5.4%", "+7.3%", "+5.9%", "+4.8%"],
      bold: true,
      hl: true,
    },
  ],
};
const INDON_SEGS: SegItem[] = [
  {
    name: "Komponen Kupon",
    rev: "5.65%",
    growth: "Fixed",
    pct: 67,
    color: "#C8A84B",
    rows: [
      {
        l: "Kupon Semi-Annual",
        v: ["2.825%", "2.825%", "2.825%", "2.825%", "2.825%", "2.825%"],
        bold: true,
      },
      {
        l: "Frekuensi Bayar",
        v: ["2x/thn", "2x/thn", "2x/thn", "2x/thn", "2x/thn", "2x/thn"],
        sub: true,
      },
      {
        l: "Next Pay Date",
        v: ["Jun 26", "Dec 25", "Jun 25", "Dec 24", "Jun 24", "Dec 23"],
        sub: true,
      },
    ],
  },
  {
    name: "Potensi FX Gain",
    rev: "+1.2%",
    growth: "Vol tinggi",
    pct: 18,
    color: "#5FB88A",
    rows: [
      {
        l: "USD/IDR Pergerakan",
        v: ["16,250", "16,050", "15,950", "15,900", "15,700", "15,600"],
        bold: true,
      },
      {
        l: "FX Impact vs Entry",
        v: ["+3.5%", "+2.2%", "+1.6%", "+1.2%", "0%", "-0.6%"],
        hl: true,
      },
    ],
  },
  {
    name: "Capital Gain",
    rev: "+0.25",
    growth: "Rate-linked",
    pct: 10,
    color: "#22C97A",
    rows: [
      {
        l: "Harga Saat Ini",
        v: ["100.25", "99.95", "100.05", "99.85", "100.50", "100.30"],
        bold: true,
      },
      {
        l: "Price Change vs Issue",
        v: ["+0.25%", "-0.05%", "+0.05%", "-0.15%", "+0.50%", "+0.30%"],
        hl: true,
      },
    ],
  },
  {
    name: "Risk Buffer",
    rev: "+165 bps",
    growth: "Spread",
    pct: 5,
    color: "#9A72E8",
    rows: [
      {
        l: "EM Sovereign Spread",
        v: ["165 bps", "155 bps", "150 bps", "160 bps", "135 bps", "140 bps"],
        bold: true,
      },
    ],
  },
];

const FR100_KS: KsData = {
  netIncome: [
    qRow("Apr 2026", "6.85%", "-15 bps", true),
    qRow("Q4 2025", "7.00%", "-10 bps", true),
    qRow("Q3 2025", "7.10%", "+5 bps", false),
    qRow("Q2 2025", "7.05%", "-5 bps", true),
    qRow("Q1 2025", "7.10%", "+0 bps", false, true),
    divRow("Karakteristik Instrumen"),
    qRow("Coupon", "6.625%", null, null),
    qRow("Maturity", "Feb 2034", null, null),
    qRow("Duration", "7.2 thn", null, null),
    qRow("Rating", "Baa2/BBB", null, null),
    qRow("Currency", "IDR", null, null),
  ],
  eps: [
    qRow("YTM", "6.85%", "Current", true),
    qRow("Coupon", "6.625%", "Fixed", true),
    qRow("Current Yield", "6.70%", "Market", true),
    qRow("Yield/Duration", "0.95", null, null),
  ],
  revenue: [
    qRow("Apr 2026", "98.80", "+1.10%", true),
    qRow("Q4 2025", "97.70", "+0.80%", true),
    qRow("Q3 2025", "96.90", "-0.40%", false),
    qRow("Q2 2025", "97.30", "+0.40%", true),
    qRow("Q1 2025", "96.90", "+0.30%", true),
  ],
  extra: { mktCap: "IDR 45 T", ev: "Nominal", shares: "Sovereign", ff: "100%" },
};
const FR100_IS: IsData = {
  cols: ["Apr 2026", "Q4 2025", "Q3 2025", "Q2 2025", "Q1 2025", "Q4 2024"],
  rows: [
    {
      l: "Harga Pasar (bid)",
      v: ["98.80", "97.70", "96.90", "97.30", "96.90", "96.60"],
      bold: true,
    },
    {
      l: "Yield to Maturity",
      v: ["6.85%", "7.00%", "7.10%", "7.05%", "7.10%", "7.12%"],
      bold: true,
      hl: true,
    },
    {
      l: "Current Yield",
      v: ["6.70%", "6.78%", "6.84%", "6.81%", "6.84%", "6.86%"],
      sub: true,
    },
    {
      l: "Kupon Accrued (IDR)",
      v: ["2.15 T", "1.05 T", "3.25 T", "2.18 T", "1.08 T", "3.30 T"],
      sub: true,
    },
    {
      l: "Spread vs BI 7DRR",
      v: [
        "+85 bps",
        "+100 bps",
        "+110 bps",
        "+105 bps",
        "+110 bps",
        "+112 bps",
      ],
      bold: true,
    },
    {
      l: "Capital Gain YTD",
      v: ["+1.10%", "+0.80%", "-0.40%", "+0.40%", "+0.30%", "-0.20%"],
      hl: true,
    },
    {
      l: "Total Return (IDR)",
      v: ["+7.95%", "+7.80%", "+6.70%", "+7.45%", "+7.40%", "+6.92%"],
      bold: true,
      hl: true,
    },
  ],
};
const FR100_SEGS: SegItem[] = [
  {
    name: "Kupon Fixed",
    rev: "6.625%",
    growth: "Fixed",
    pct: 75,
    color: "#C8A84B",
    rows: [
      {
        l: "Kupon Semi-Annual",
        v: ["3.3125%", "3.3125%", "3.3125%", "3.3125%", "3.3125%", "3.3125%"],
        bold: true,
      },
      {
        l: "Next Pay Date",
        v: ["Aug 26", "Feb 26", "Aug 25", "Feb 25", "Aug 24", "Feb 24"],
        sub: true,
      },
    ],
  },
  {
    name: "Capital Gain",
    rev: "+1.10%",
    growth: "Rate-linked",
    pct: 18,
    color: "#22C97A",
    rows: [
      {
        l: "Harga vs Entry",
        v: ["98.80", "97.70", "96.90", "97.30", "96.90", "96.60"],
        bold: true,
      },
      {
        l: "YTD Price Change",
        v: ["+1.10%", "+0.80%", "-0.40%", "+0.40%", "+0.30%", "-0.20%"],
        hl: true,
      },
    ],
  },
  {
    name: "Spread Premium",
    rev: "+85 bps",
    growth: "Menyempit",
    pct: 7,
    color: "#5FB88A",
    rows: [
      {
        l: "Spread vs BI7DRR",
        v: ["85 bps", "100 bps", "110 bps", "105 bps", "110 bps", "112 bps"],
        bold: true,
      },
    ],
  },
];

const INDOIS_KS: KsData = {
  netIncome: [
    qRow("Apr 2026", "5.75%", "+5 bps", false),
    qRow("Q4 2025", "5.70%", "+5 bps", false),
    qRow("Q3 2025", "5.65%", "-5 bps", true),
    qRow("Q2 2025", "5.70%", "+10 bps", false),
    qRow("Q1 2025", "5.60%", "-10 bps", true, true),
    divRow("Karakteristik Instrumen"),
    qRow("Coupon", "5.55%", null, null),
    qRow("Maturity", "Jun 2034", null, null),
    qRow("Duration", "7.5 thn", null, null),
    qRow("Structure", "Wakalah Sukuk", null, null),
    qRow("Currency", "USD", null, null),
  ],
  eps: [
    qRow("YTM", "5.75%", "Current", true),
    qRow("Profit Rate", "5.55%", "Fixed", true),
    qRow("Current Yield", "5.56%", "Market", true),
  ],
  revenue: [
    qRow("Apr 2026", "100.15", "+0.20%", true),
    qRow("Q4 2025", "99.95", "-0.05%", false),
    qRow("Q3 2025", "100.00", "+0.10%", true),
    qRow("Q2 2025", "99.90", "-0.35%", false),
    qRow("Q1 2025", "100.25", "+0.25%", true),
  ],
  extra: {
    mktCap: "USD 1.2 B",
    ev: "Nominal",
    shares: "Sovereign",
    ff: "100%",
  },
};
const INDOIS_IS = genIS(0);
INDOIS_IS.rows = INDON_IS.rows.map((row) => ({
  ...row,
  v: row.v.map((value, index) => {
    const factors: Record<string, Array<string>> = {
      "Harga Pasar (bid)": [
        "100.15",
        "99.95",
        "100.00",
        "99.90",
        "100.25",
        "100.10",
      ],
      "Yield to Maturity": [
        "5.75%",
        "5.70%",
        "5.65%",
        "5.70%",
        "5.60%",
        "5.55%",
      ],
    };
    return factors[row.l] ? factors[row.l][index] : value;
  }),
}));
INDOIS_IS.cols = INDON_IS.cols;
const INDOIS_SEGS: SegItem[] = INDON_SEGS.map((seg) => ({ ...seg }));

const MMFUSD_KS: KsData = {
  netIncome: [
    qRow("Apr 2026", "5.25%", "+10 bps", true),
    qRow("Q4 2025", "5.15%", "+5 bps", true),
    qRow("Q3 2025", "5.10%", "-5 bps", false),
    qRow("Q2 2025", "5.15%", "+10 bps", true),
    qRow("Q1 2025", "5.05%", "-15 bps", false, true),
    divRow("Karakteristik Reksadana"),
    qRow("Manajer Investasi", "Bahana TCW", null, null),
    qRow("Bank Kustodian", "BCA", null, null),
    qRow("Biaya Pengelolaan", "1.0%/thn", null, null),
    qRow("Minimum Invest", "USD 100", null, null),
  ],
  eps: [
    qRow("Yield Saat Ini", "5.25%", "Net", true),
    qRow("Biaya MI", "1.00%", "Annual", true),
    qRow("Net Return", "~4.25%", "Net fee", true),
  ],
  revenue: [
    qRow("Apr 2026", "1.0525", "+0.42%", true),
    qRow("Q4 2025", "1.0482", "+1.25%", true),
    qRow("Q3 2025", "1.0352", "+1.28%", true),
    qRow("Q2 2025", "1.0221", "+1.35%", true),
    qRow("Q1 2025", "1.0085", "+0.85%", true),
  ],
  extra: { mktCap: "USD 850 M", ev: "AUM", shares: "~800 unit", ff: "-" },
};
const MMFUSD_IS: IsData = {
  cols: ["Apr 2026", "Q4 2025", "Q3 2025", "Q2 2025", "Q1 2025", "Q4 2024"],
  rows: [
    {
      l: "NAB per Unit (USD)",
      v: ["1.0525", "1.0482", "1.0352", "1.0221", "1.0085", "1.0000"],
      bold: true,
    },
    {
      l: "Yield Gross",
      v: ["5.25%", "5.15%", "5.10%", "5.15%", "5.05%", "4.95%"],
      hl: true,
    },
    {
      l: "Biaya Pengelolaan",
      v: ["(1.00%)", "(1.00%)", "(1.00%)", "(1.00%)", "(1.00%)", "(1.00%)"],
      neg: true,
      sub: true,
    },
    {
      l: "Net Yield Investor",
      v: ["4.25%", "4.15%", "4.10%", "4.15%", "4.05%", "3.95%"],
      bold: true,
      hl: true,
    },
    {
      l: "FX Impact (IDR)",
      v: ["+1.2%", "+0.8%", "-0.3%", "+1.5%", "+0.4%", "-0.8%"],
      hl: true,
    },
    {
      l: "Total Return IDR (est.)",
      v: ["+5.45%", "+4.95%", "+3.80%", "+5.65%", "+4.45%", "+3.15%"],
      bold: true,
      hl: true,
    },
  ],
};
const MMFUSD_SEGS: SegItem[] = [
  {
    name: "Deposito USD Bank Lokal",
    rev: "65%",
    growth: "Stabil",
    pct: 65,
    color: "#3A9EE8",
    rows: [
      {
        l: "Deposito Tier-1 Banks",
        v: ["550 M", "540 M", "530 M", "520 M", "510 M", "500 M"],
        bold: true,
      },
      {
        l: "Tenor Rata-rata",
        v: ["3 bln", "3 bln", "3 bln", "3 bln", "3 bln", "3 bln"],
        sub: true,
      },
    ],
  },
  {
    name: "Obligasi Pemerintah USD",
    rev: "25%",
    growth: "Stabil",
    pct: 25,
    color: "#C8A84B",
    rows: [
      {
        l: "INDON Jangka Pendek",
        v: ["210 M", "205 M", "200 M", "195 M", "190 M", "185 M"],
        bold: true,
      },
    ],
  },
  {
    name: "Pasar Uang Korporasi",
    rev: "8%",
    growth: "Moderat",
    pct: 8,
    color: "#22C97A",
    rows: [
      {
        l: "MTN Korporasi BUMN",
        v: ["68 M", "65 M", "63 M", "60 M", "58 M", "55 M"],
        bold: true,
      },
    ],
  },
  {
    name: "Kas Likuid",
    rev: "2%",
    growth: "-",
    pct: 2,
    color: "#9A72E8",
    rows: [
      {
        l: "Kas & Setara Kas",
        v: ["17 M", "15 M", "13 M", "12 M", "11 M", "10 M"],
        bold: true,
      },
    ],
  },
];

const SPY_KS: KsData = {
  netIncome: [
    qRow("Apr 2026", "+12.5%", "YTD", true),
    qRow("FY 2025", "+24.5%", "Annual", true),
    qRow("FY 2024", "+23.1%", "Annual", true),
    qRow("FY 2023", "+26.3%", "Annual", true),
    qRow("5Y CAGR", "+14.2%", "Annual", true, true),
    divRow("Karakteristik ETF"),
    qRow("Expense Ratio", "0.09%", null, null),
    qRow("Tracks", "S&P 500 Index", null, null),
    qRow("Dividend Yield", "1.35%", null, null),
    qRow("AUM", "USD 600 B", null, null),
  ],
  eps: [
    qRow("Div/Unit TTM", "6.85", "Trailing", true),
    qRow("PE Forward", "22.5x", "Market", true),
    qRow("EPS Growth", "+11%", "Consensus", true),
  ],
  revenue: [
    qRow("Apr 2026", "565.20", "+12.5%", true),
    qRow("Q4 2025", "520.40", "+8.2%", true),
    qRow("Q3 2025", "481.00", "+6.5%", true),
    qRow("Q2 2025", "451.60", "+4.8%", true),
    qRow("Q1 2025", "430.95", "+3.1%", true),
  ],
  extra: { mktCap: "USD 600 B", ev: "AUM", shares: "955 M", ff: "100%" },
};
const SPY_IS: IsData = {
  cols: ["Apr 2026", "Q4 2025", "Q3 2025", "Q2 2025", "Q1 2025", "Q4 2024"],
  rows: [
    {
      l: "Harga ETF (USD)",
      v: ["565.20", "520.40", "481.00", "451.60", "430.95", "418.00"],
      bold: true,
    },
    {
      l: "Return YTD",
      v: ["+12.5%", "+24.5%", "+15.1%", "+8.0%", "+3.1%", "+23.1%"],
      hl: true,
    },
    {
      l: "Dividen Kuartalan",
      v: ["1.72", "1.76", "1.74", "1.71", "1.64", "1.61"],
      sub: true,
    },
    {
      l: "Dividend Yield",
      v: ["1.35%", "1.38%", "1.40%", "1.38%", "1.41%", "1.40%"],
      sub: true,
    },
    {
      l: "P/E Forward",
      v: ["22.5x", "21.8x", "21.2x", "20.5x", "19.8x", "20.1x"],
      sub: true,
    },
    {
      l: "Volatility (30D)",
      v: ["13.5%", "14.2%", "15.8%", "16.5%", "14.0%", "13.0%"],
      sub: true,
    },
    {
      l: "Total Return IDR (FX)",
      v: ["+13.7%", "+25.3%", "+14.8%", "+9.5%", "+3.5%", "+22.3%"],
      bold: true,
      hl: true,
    },
  ],
};
const SPY_SEGS: SegItem[] = [
  {
    name: "Technology",
    rev: "31%",
    growth: "+22%",
    pct: 31,
    color: "#5FB88A",
    rows: [
      {
        l: "AAPL, MSFT, NVDA, GOOGL",
        v: ["186 B", "170 B", "155 B", "140 B", "130 B", "125 B"],
        bold: true,
      },
    ],
  },
  {
    name: "Financials",
    rev: "13%",
    growth: "+11%",
    pct: 13,
    color: "#3A9EE8",
    rows: [
      {
        l: "JPM, BAC, BRK, V, MA",
        v: ["78 B", "74 B", "70 B", "66 B", "63 B", "60 B"],
        bold: true,
      },
    ],
  },
  {
    name: "Healthcare",
    rev: "12%",
    growth: "+6%",
    pct: 12,
    color: "#E84A8C",
    rows: [
      {
        l: "UNH, LLY, JNJ, MRK",
        v: ["72 B", "70 B", "68 B", "66 B", "64 B", "62 B"],
        bold: true,
      },
    ],
  },
  {
    name: "Consumer Discretionary",
    rev: "11%",
    growth: "+9%",
    pct: 11,
    color: "#F0A030",
    rows: [
      {
        l: "AMZN, TSLA, HD, MCD",
        v: ["66 B", "62 B", "58 B", "55 B", "52 B", "50 B"],
        bold: true,
      },
    ],
  },
  {
    name: "Industrials",
    rev: "9%",
    growth: "+8%",
    pct: 9,
    color: "#9A72E8",
    rows: [
      {
        l: "Boeing, Caterpillar, Etc.",
        v: ["54 B", "52 B", "50 B", "48 B", "46 B", "44 B"],
        bold: true,
      },
    ],
  },
  {
    name: "Communication",
    rev: "9%",
    growth: "+15%",
    pct: 9,
    color: "#22C97A",
    rows: [
      {
        l: "META, NFLX, DIS, VZ",
        v: ["54 B", "50 B", "46 B", "42 B", "40 B", "38 B"],
        bold: true,
      },
    ],
  },
  {
    name: "Consumer Staples",
    rev: "6%",
    growth: "+4%",
    pct: 6,
    color: "#8AE84A",
    rows: [
      {
        l: "WMT, PG, KO, PEP",
        v: ["36 B", "35 B", "34 B", "33 B", "32 B", "31 B"],
        bold: true,
      },
    ],
  },
  {
    name: "Energy + Lainnya",
    rev: "9%",
    growth: "+5%",
    pct: 9,
    color: "#E04848",
    rows: [
      {
        l: "XOM, CVX, + sektor lain",
        v: ["54 B", "52 B", "50 B", "48 B", "46 B", "44 B"],
        bold: true,
      },
    ],
  },
];

const QQQ_KS = deepClone(SPY_KS);
QQQ_KS.extra = { mktCap: "USD 310 B", ev: "AUM", shares: "580 M", ff: "100%" };
QQQ_KS.netIncome[0] = { p: "Apr 2026", v: "+18.2%", g: "YTD", pos: true };
QQQ_KS.netIncome[1] = { p: "FY 2025", v: "+30.5%", g: "Annual", pos: true };
QQQ_KS.netIncome[4] = {
  p: "5Y CAGR",
  v: "+18.5%",
  g: "Annual",
  pos: true,
  bold: true,
};
QQQ_KS.netIncome[6] = { p: "Expense Ratio", v: "0.20%", g: null };
QQQ_KS.netIncome[7] = { p: "Tracks", v: "Nasdaq 100", g: null };
QQQ_KS.netIncome[8] = { p: "Dividend Yield", v: "0.55%", g: null };
QQQ_KS.netIncome[9] = { p: "AUM", v: "USD 310 B", g: null };
QQQ_KS.revenue[0] = { p: "Apr 2026", v: "545.80", g: "+18.2%", pos: true };
QQQ_KS.revenue[1] = { p: "Q4 2025", v: "488.50", g: "+12.5%", pos: true };
QQQ_KS.revenue[2] = { p: "Q3 2025", v: "445.20", g: "+9.2%", pos: true };
const QQQ_IS = deepClone(SPY_IS);
QQQ_IS.rows[0].v = ["545.80", "488.50", "445.20", "402.50", "385.00", "370.00"];
QQQ_IS.rows[1].v = ["+18.2%", "+30.5%", "+20.3%", "+10.2%", "+5.5%", "+28.5%"];
const QQQ_SEGS: SegItem[] = [
  {
    name: "Technology",
    rev: "59%",
    growth: "+28%",
    pct: 59,
    color: "#5FB88A",
    rows: [
      {
        l: "AAPL, MSFT, NVDA, META, GOOGL",
        v: ["185 B", "165 B", "150 B", "135 B", "128 B", "120 B"],
        bold: true,
      },
    ],
  },
  {
    name: "Consumer Discretionary",
    rev: "18%",
    growth: "+12%",
    pct: 18,
    color: "#F0A030",
    rows: [
      {
        l: "AMZN, TSLA, COST",
        v: ["56 B", "52 B", "48 B", "45 B", "42 B", "40 B"],
        bold: true,
      },
    ],
  },
  {
    name: "Communication",
    rev: "15%",
    growth: "+20%",
    pct: 15,
    color: "#22C97A",
    rows: [
      {
        l: "META, GOOG, NFLX",
        v: ["47 B", "42 B", "38 B", "35 B", "32 B", "30 B"],
        bold: true,
      },
    ],
  },
  {
    name: "Healthcare & Lainnya",
    rev: "8%",
    growth: "+8%",
    pct: 8,
    color: "#E84A8C",
    rows: [
      {
        l: "Biotech + lainnya",
        v: ["25 B", "24 B", "23 B", "22 B", "21 B", "20 B"],
        bold: true,
      },
    ],
  },
];

const MMFIDR_KS: KsData = {
  netIncome: [
    qRow("Apr 2026", "6.25%", "+10 bps", true),
    qRow("Q4 2025", "6.15%", "+5 bps", true),
    qRow("Q3 2025", "6.10%", "-5 bps", false),
    qRow("Q2 2025", "6.15%", "+10 bps", true),
    qRow("Q1 2025", "6.05%", "+5 bps", true, true),
    divRow("Karakteristik Reksadana"),
    qRow("Manajer Investasi", "Mandiri MI", null, null),
    qRow("Bank Kustodian", "Mandiri", null, null),
    qRow("Biaya Pengelolaan", "0.75%/thn", null, null),
    qRow("Minimum Invest", "IDR 100 rb", null, null),
  ],
  eps: [
    qRow("Yield Saat Ini", "6.25%", "Gross", true),
    qRow("Net Yield", "5.50%", "After fee", true),
    qRow("vs Deposito", "+150 bps", "Premium", true),
  ],
  revenue: [
    qRow("Apr 2026", "1.325", "+0.52%", true),
    qRow("Q4 2025", "1.318", "+1.52%", true),
    qRow("Q3 2025", "1.298", "+1.52%", true),
    qRow("Q2 2025", "1.278", "+1.51%", true),
    qRow("Q1 2025", "1.259", "+1.53%", true),
  ],
  extra: { mktCap: "IDR 12 T", ev: "AUM", shares: "~9 T unit", ff: "-" },
};
const MMFIDR_IS: IsData = {
  cols: ["Apr 2026", "Q4 2025", "Q3 2025", "Q2 2025", "Q1 2025", "Q4 2024"],
  rows: [
    {
      l: "NAB per Unit (IDR)",
      v: ["1.325", "1.318", "1.298", "1.278", "1.259", "1.240"],
      bold: true,
    },
    {
      l: "Yield Gross",
      v: ["6.25%", "6.15%", "6.10%", "6.15%", "6.05%", "5.95%"],
      hl: true,
    },
    {
      l: "Biaya Pengelolaan",
      v: ["(0.75%)", "(0.75%)", "(0.75%)", "(0.75%)", "(0.75%)", "(0.75%)"],
      neg: true,
      sub: true,
    },
    {
      l: "Net Yield Investor",
      v: ["5.50%", "5.40%", "5.35%", "5.40%", "5.30%", "5.20%"],
      bold: true,
      hl: true,
    },
    {
      l: "vs Deposito 1bln",
      v: [
        "+150 bps",
        "+140 bps",
        "+135 bps",
        "+140 bps",
        "+130 bps",
        "+120 bps",
      ],
      sub: true,
    },
  ],
};
const MMFIDR_SEGS: SegItem[] = [
  {
    name: "Deposito IDR Bank Lokal",
    rev: "70%",
    growth: "Stabil",
    pct: 70,
    color: "#3A9EE8",
    rows: [
      {
        l: "Deposito Tier-1 (BCA, BMRI, BBNI)",
        v: ["8.4 T", "8.2 T", "8.0 T", "7.8 T", "7.6 T", "7.4 T"],
        bold: true,
      },
    ],
  },
  {
    name: "SBN Jangka Pendek",
    rev: "22%",
    growth: "Moderat",
    pct: 22,
    color: "#C8A84B",
    rows: [
      {
        l: "FR Short & SBSN",
        v: ["2.65 T", "2.58 T", "2.50 T", "2.45 T", "2.40 T", "2.35 T"],
        bold: true,
      },
    ],
  },
  {
    name: "Pasar Uang Korporasi",
    rev: "6%",
    growth: "Moderat",
    pct: 6,
    color: "#22C97A",
    rows: [
      {
        l: "MTN Korporasi BUMN",
        v: ["0.72 T", "0.70 T", "0.68 T", "0.65 T", "0.62 T", "0.60 T"],
        bold: true,
      },
    ],
  },
  {
    name: "Kas Likuid",
    rev: "2%",
    growth: "-",
    pct: 2,
    color: "#9A72E8",
    rows: [
      {
        l: "Kas & Setara Kas",
        v: ["0.24 T", "0.22 T", "0.20 T", "0.18 T", "0.16 T", "0.15 T"],
        bold: true,
      },
    ],
  },
];

const XIDX_KS: KsData = {
  netIncome: [
    qRow("Apr 2026", "+3.2%", "YTD", true),
    qRow("FY 2025", "+6.8%", "Annual", true),
    qRow("FY 2024", "-3.2%", "Annual", false),
    qRow("FY 2023", "+6.5%", "Annual", true),
    qRow("5Y CAGR", "+5.8%", "Annual", true, true),
    divRow("Karakteristik ETF"),
    qRow("Expense Ratio", "0.50%", null, null),
    qRow("Tracks", "IDX30 Index", null, null),
    qRow("Dividend Yield", "4.2%", null, null),
    qRow("AUM", "IDR 2.5 T", null, null),
  ],
  eps: [
    qRow("Div/Unit TTM", "185", "Trailing", true),
    qRow("PE Forward", "12.5x", "Market", true),
    qRow("Sector Mix", "Banking-heavy", "-", true),
  ],
  revenue: [
    qRow("Apr 2026", "4.450", "+3.2%", true),
    qRow("Q4 2025", "4.312", "+2.1%", true),
    qRow("Q3 2025", "4.225", "+1.8%", true),
    qRow("Q2 2025", "4.150", "-0.5%", false),
    qRow("Q1 2025", "4.170", "+0.4%", true),
  ],
  extra: { mktCap: "IDR 2.5 T", ev: "AUM", shares: "560 M", ff: "100%" },
};
const XIDX_IS: IsData = {
  cols: ["Apr 2026", "Q4 2025", "Q3 2025", "Q2 2025", "Q1 2025", "Q4 2024"],
  rows: [
    {
      l: "Harga ETF (IDR)",
      v: ["4.450", "4.312", "4.225", "4.150", "4.170", "4.080"],
      bold: true,
    },
    {
      l: "Return YTD",
      v: ["+3.2%", "+6.8%", "+3.6%", "+1.7%", "+2.2%", "-3.2%"],
      hl: true,
    },
    {
      l: "Dividen Kuartalan",
      v: ["46", "48", "47", "45", "44", "42"],
      sub: true,
    },
    {
      l: "Dividend Yield",
      v: ["4.20%", "4.25%", "4.30%", "4.22%", "4.15%", "4.10%"],
      sub: true,
    },
    {
      l: "P/E Forward",
      v: ["12.5x", "12.2x", "12.0x", "11.8x", "11.5x", "11.2x"],
      sub: true,
    },
  ],
};
const XIDX_SEGS: SegItem[] = [
  {
    name: "Perbankan",
    rev: "42%",
    growth: "+5%",
    pct: 42,
    color: "#3A9EE8",
    rows: [
      {
        l: "BBCA, BMRI, BBRI, BBNI",
        v: ["1.05 T", "1.02 T", "1.00 T", "0.98 T", "0.96 T", "0.92 T"],
        bold: true,
      },
    ],
  },
  {
    name: "Konsumer",
    rev: "18%",
    growth: "+8%",
    pct: 18,
    color: "#22C97A",
    rows: [
      {
        l: "UNVR, ICBP, INDF, MYOR",
        v: ["450 B", "440 B", "430 B", "420 B", "410 B", "395 B"],
        bold: true,
      },
    ],
  },
  {
    name: "Telekomunikasi",
    rev: "12%",
    growth: "+4%",
    pct: 12,
    color: "#9A72E8",
    rows: [
      {
        l: "TLKM, ISAT, EXCL",
        v: ["300 B", "295 B", "290 B", "285 B", "280 B", "275 B"],
        bold: true,
      },
    ],
  },
  {
    name: "Energi & Mining",
    rev: "15%",
    growth: "+3%",
    pct: 15,
    color: "#F0A030",
    rows: [
      {
        l: "ADRO, PTBA, MEDC, ANTM",
        v: ["375 B", "365 B", "360 B", "355 B", "350 B", "345 B"],
        bold: true,
      },
    ],
  },
  {
    name: "Konstruksi & Semen",
    rev: "8%",
    growth: "-2%",
    pct: 8,
    color: "#4AE8C8",
    rows: [
      {
        l: "SMGR, INTP, WIKA, PTPP",
        v: ["200 B", "198 B", "200 B", "205 B", "210 B", "215 B"],
        bold: true,
      },
    ],
  },
  {
    name: "Lainnya",
    rev: "5%",
    growth: "+5%",
    pct: 5,
    color: "#E84A8C",
    rows: [
      {
        l: "Otomotif, Infra, Lainnya",
        v: ["125 B", "122 B", "120 B", "118 B", "115 B", "112 B"],
        bold: true,
      },
    ],
  },
];

const SMSNG_KS = genIntlKS(
  21.5,
  "3.22",
  195,
  "$350 B",
  "$340 B",
  "5.97 B",
  "71%",
  62,
  5,
);
const SMSNG_IS = genIntlIS(195, 21.5);
const SMSNG_SEGS = genIntlSegs([
  {
    n: "Semiconductor (DRAM,NAND)",
    r: "$78 B",
    g: "+15%",
    p: 40,
    c: "#3A9EE8",
  },
  {
    n: "Consumer Electronics (TV,Home)",
    r: "$58 B",
    g: "-2%",
    p: 30,
    c: "#22C97A",
  },
  { n: "Mobile (Galaxy)", r: "$45 B", g: "+3%", p: 23, c: "#9A72E8" },
  { n: "Harman & Others", r: "$14 B", g: "+5%", p: 7, c: "#C8A84B" },
]);

const ASML_KS = genIntlKS(
  8.8,
  "22.1",
  28,
  "$320 B",
  "$315 B",
  "0.40 B",
  "93%",
  790,
  12,
);
const ASML_IS = genIntlIS(28, 8.8);
const ASML_SEGS = genIntlSegs([
  { n: "EUV Systems", r: "$16 B", g: "+18%", p: 57, c: "#5FB88A" },
  { n: "DUV Systems", r: "$8 B", g: "+5%", p: 29, c: "#3A9EE8" },
  { n: "Service & Install", r: "$4 B", g: "+10%", p: 14, c: "#9A72E8" },
]);

const LVMH_KS = genIntlKS(
  12.4,
  "24.8",
  96,
  "$340 B",
  "$355 B",
  "0.50 B",
  "53%",
  670,
  4,
);
const LVMH_IS = genIntlIS(96, 12.4);
const LVMH_SEGS = genIntlSegs([
  {
    n: "Fashion & Leather (LV,Dior)",
    r: "$44 B",
    g: "+6%",
    p: 46,
    c: "#C8A84B",
  },
  {
    n: "Selective Retailing (Sephora)",
    r: "$20 B",
    g: "+10%",
    p: 21,
    c: "#E84A8C",
  },
  { n: "Perfumes & Cosmetics", r: "$10 B", g: "+8%", p: 10, c: "#9A72E8" },
  {
    n: "Wines & Spirits (Moet,Hennessy)",
    r: "$9 B",
    g: "-3%",
    p: 9,
    c: "#F0A030",
  },
  { n: "Watches & Jewelry (Bulgari)", r: "$8 B", g: "+5%", p: 8, c: "#3A9EE8" },
  { n: "Other", r: "$5 B", g: "+2%", p: 6, c: "#22C97A" },
]);

const HERMES_KS = genIntlKS(
  5.8,
  "55.5",
  14,
  "$230 B",
  "$225 B",
  "0.10 B",
  "34%",
  2280,
  10,
);
const HERMES_IS = genIntlIS(14, 5.8);
const HERMES_SEGS = genIntlSegs([
  {
    n: "Leather Goods & Saddlery",
    r: "$7.2 B",
    g: "+12%",
    p: 51,
    c: "#C8A84B",
  },
  {
    n: "Ready-to-Wear & Accessories",
    r: "$3.1 B",
    g: "+9%",
    p: 22,
    c: "#E84A8C",
  },
  { n: "Silk & Textiles", r: "$1.5 B", g: "+6%", p: 11, c: "#9A72E8" },
  { n: "Perfume & Beauty", r: "$1.1 B", g: "+8%", p: 8, c: "#F0A030" },
  { n: "Other Hermes Metiers", r: "$1.1 B", g: "+5%", p: 8, c: "#3A9EE8" },
]);

const SHELL_KS = genIntlKS(
  28.5,
  "3.80",
  380,
  "$210 B",
  "$230 B",
  "7.4 B",
  "99%",
  29,
  3,
);
const SHELL_IS = genIntlIS(380, 28.5);
const SHELL_SEGS = genIntlSegs([
  { n: "Integrated Gas (LNG)", r: "$95 B", g: "+5%", p: 25, c: "#F0A030" },
  { n: "Upstream (E&P)", r: "$95 B", g: "+2%", p: 25, c: "#E04848" },
  { n: "Marketing (Retail)", r: "$95 B", g: "+3%", p: 25, c: "#22C97A" },
  { n: "Chemicals & Products", r: "$76 B", g: "-2%", p: 20, c: "#3A9EE8" },
  { n: "Renewables & Energy", r: "$19 B", g: "+25%", p: 5, c: "#5FB88A" },
]);

const NESTLE_KS = genIntlKS(
  11.2,
  "3.82",
  94,
  "$245 B",
  "$250 B",
  "2.94 B",
  "70%",
  83,
  3,
);
const NESTLE_IS = genIntlIS(94, 11.2);
const NESTLE_SEGS = genIntlSegs([
  {
    n: "Powdered & Liquid Bev. (Nescafe)",
    r: "$28 B",
    g: "+5%",
    p: 30,
    c: "#F0A030",
  },
  {
    n: "Nutrition & Health Science",
    r: "$19 B",
    g: "+8%",
    p: 20,
    c: "#E84A8C",
  },
  { n: "Petcare (Purina)", r: "$19 B", g: "+10%", p: 20, c: "#22C97A" },
  { n: "Prepared Dishes & Cooking", r: "$14 B", g: "+2%", p: 15, c: "#3A9EE8" },
  { n: "Confectionery (KitKat)", r: "$10 B", g: "+1%", p: 11, c: "#C8A84B" },
  { n: "Others", r: "$4 B", g: "+3%", p: 4, c: "#9A72E8" },
]);

const TOYOTA_KS = genIntlKS(
  31.2,
  "213",
  305,
  "$265 B",
  "$275 B",
  "1.46 B",
  "73%",
  182,
  5,
);
const TOYOTA_IS = genIntlIS(305, 31.2);
const TOYOTA_SEGS = genIntlSegs([
  {
    n: "Automotive (Japan & Global)",
    r: "$240 B",
    g: "+4%",
    p: 79,
    c: "#E04848",
  },
  { n: "Financial Services", r: "$40 B", g: "+6%", p: 13, c: "#3A9EE8" },
  { n: "All Other (Daihatsu, Hino)", r: "$25 B", g: "+2%", p: 8, c: "#F0A030" },
]);

const SAP_KS = genIntlKS(
  6.2,
  "5.28",
  36,
  "$290 B",
  "$285 B",
  "1.17 B",
  "89%",
  248,
  18,
);
const SAP_IS = genIntlIS(36, 6.2);
const SAP_SEGS = genIntlSegs([
  {
    n: "Cloud (S/4HANA, BTP, Ariba)",
    r: "$17 B",
    g: "+28%",
    p: 47,
    c: "#5FB88A",
  },
  {
    n: "Software Licenses & Support",
    r: "$12 B",
    g: "-5%",
    p: 33,
    c: "#3A9EE8",
  },
  { n: "Services & Support", r: "$5 B", g: "+5%", p: 14, c: "#9A72E8" },
  { n: "Other", r: "$2 B", g: "+2%", p: 6, c: "#C8A84B" },
]);

const PINGAN_KS = genIntlKS(
  15.8,
  "8.44",
  180,
  "$120 B",
  "$115 B",
  "18.28 B",
  "42%",
  44,
  8,
);
const PINGAN_IS = genIntlIS(180, 15.8);
const PINGAN_SEGS = genIntlSegs([
  { n: "Life & Health Insurance", r: "$85 B", g: "+6%", p: 47, c: "#E04848" },
  { n: "Property & Casualty Ins.", r: "$38 B", g: "+5%", p: 21, c: "#F0A030" },
  { n: "Banking (Ping An Bank)", r: "$32 B", g: "+3%", p: 18, c: "#3A9EE8" },
  {
    n: "Technology (Lufax, OneConnect)",
    r: "$25 B",
    g: "+12%",
    p: 14,
    c: "#5FB88A",
  },
]);

const BABA_KS = genIntlKS(
  15.2,
  "5.82",
  130,
  "$230 B",
  "$225 B",
  "26.1 B",
  "94%",
  88,
  5,
);
const BABA_IS = genIntlIS(130, 15.2);
const BABA_SEGS = genIntlSegs([
  {
    n: "Taobao & Tmall (China Commerce)",
    r: "$65 B",
    g: "+3%",
    p: 50,
    c: "#F0A030",
  },
  {
    n: "Cloud Intelligence (Alibaba Cloud)",
    r: "$15 B",
    g: "+18%",
    p: 12,
    c: "#5FB88A",
  },
  {
    n: "International Digital Commerce",
    r: "$12 B",
    g: "+32%",
    p: 9,
    c: "#3A9EE8",
  },
  { n: "Logistics (Cainiao)", r: "$12 B", g: "+20%", p: 9, c: "#22C97A" },
  {
    n: "Local Services & Entertainment",
    r: "$26 B",
    g: "+5%",
    p: 20,
    c: "#9A72E8",
  },
]);

const NOVO_KS = genIntlKS(
  12.8,
  "2.86",
  36,
  "$450 B",
  "$445 B",
  "4.47 B",
  "99%",
  100,
  28,
);
const NOVO_IS = genIntlIS(36, 12.8);
const NOVO_SEGS = genIntlSegs([
  { n: "GLP-1 (Ozempic, Wegovy)", r: "$22 B", g: "+45%", p: 61, c: "#E84A8C" },
  { n: "Insulin & Diabetes Care", r: "$10 B", g: "+4%", p: 28, c: "#3A9EE8" },
  { n: "Other Chronic Disease", r: "$4 B", g: "+8%", p: 11, c: "#22C97A" },
]);

const DBS_KS = genIntlKS(
  5.8,
  "2.18",
  20,
  "$78 B",
  "$75 B",
  "2.66 B",
  "65%",
  38,
  8,
);
const DBS_IS = genIntlIS(20, 5.8);
const DBS_SEGS = genIntlSegs([
  { n: "Consumer Banking (SG, HK)", r: "$8 B", g: "+5%", p: 40, c: "#3A9EE8" },
  { n: "Institutional Banking", r: "$7 B", g: "+8%", p: 35, c: "#22C97A" },
  { n: "Treasury & Markets", r: "$3 B", g: "+2%", p: 15, c: "#C8A84B" },
  { n: "Others (Digital, Wealth)", r: "$2 B", g: "+15%", p: 10, c: "#5FB88A" },
]);

const SE_KS = genIntlKS(
  1.8,
  "1.12",
  14,
  "$55 B",
  "$52 B",
  "1.62 B",
  "99%",
  110,
  22,
);
const SE_IS = genIntlIS(14, 1.8);
const SE_SEGS = genIntlSegs([
  {
    n: "Garena (Digital Entertainment)",
    r: "$2 B",
    g: "-8%",
    p: 14,
    c: "#9A72E8",
  },
  { n: "Shopee (E-Commerce SEA)", r: "$8 B", g: "+28%", p: 57, c: "#F0A030" },
  {
    n: "SeaMoney (Digital Finance)",
    r: "$4 B",
    g: "+35%",
    p: 29,
    c: "#22C97A",
  },
]);

const GRAB_KS = genIntlKS(
  0.6,
  "0.12",
  2.8,
  "$20 B",
  "$18 B",
  "3.85 B",
  "99%",
  4.2,
  35,
);
const GRAB_IS = genIntlIS(2.8, 0.6);
const GRAB_SEGS = genIntlSegs([
  { n: "Deliveries (GrabFood)", r: "$1.4 B", g: "+22%", p: 50, c: "#22C97A" },
  { n: "Mobility (GrabCar)", r: "$0.8 B", g: "+18%", p: 29, c: "#F0A030" },
  {
    n: "Financial Services (OVO/GrabPay)",
    r: "$0.6 B",
    g: "+40%",
    p: 21,
    c: "#3A9EE8",
  },
]);

export const extraReportFinancials: Record<string, ReportFinancials> = {
  ADMR: { ks: ADMR_KS, is: ADMR_IS, segs: ADMR_SEGS },
  EXCL: { ks: EXCL_KS, is: EXCL_IS, segs: EXCL_SEGS },
  INCO: { ks: INCO_KS, is: INCO_IS, segs: INCO_SEGS },
  MDKA: { ks: MDKA_KS, is: MDKA_IS, segs: MDKA_SEGS },
  PTBA: { ks: PTBA_KS, is: PTBA_IS, segs: PTBA_SEGS },
  KLBF: { ks: KLBF_KS, is: KLBF_IS, segs: KLBF_SEGS },
  CPIN: { ks: CPIN_KS, is: CPIN_IS, segs: CPIN_SEGS },
  PGAS: { ks: PGAS_KS, is: PGAS_IS, segs: PGAS_SEGS },
  SMGR: { ks: SMGR_KS, is: SMGR_IS, segs: SMGR_SEGS },
  UNVR: { ks: UNVR_KS, is: UNVR_IS, segs: UNVR_SEGS },
  TPIA: { ks: TPIA_KS, is: TPIA_IS, segs: TPIA_SEGS },
  SIDO: { ks: SIDO_KS, is: SIDO_IS, segs: SIDO_SEGS },
  AADI: { ks: AADI_KS, is: AADI_IS, segs: AADI_SEGS },
  AALI: { ks: AALI_KS, is: AALI_IS, segs: AALI_SEGS },
  LSIP: { ks: LSIP_KS, is: LSIP_IS, segs: LSIP_SEGS },
  HRUM: { ks: HRUM_KS, is: HRUM_IS, segs: HRUM_SEGS },
  ANTM: { ks: ANTM_KS, is: ANTM_IS, segs: ANTM_SEGS },
  AAPL: { ks: AAPL_KS, is: AAPL_IS, segs: AAPL_SEGS },
  MSFT: { ks: MSFT_KS, is: MSFT_IS, segs: MSFT_SEGS },
  NVDA: { ks: NVDA_KS, is: NVDA_IS, segs: NVDA_SEGS },
  GOOGL: { ks: GOOGL_KS, is: GOOGL_IS, segs: GOOGL_SEGS },
  TSM: { ks: TSM_KS, is: TSM_IS, segs: TSM_SEGS },
  "INDON 2034": { ks: INDON_KS, is: INDON_IS, segs: INDON_SEGS },
  FR100: { ks: FR100_KS, is: FR100_IS, segs: FR100_SEGS },
  "INDOIS 2034": { ks: INDOIS_KS, is: INDOIS_IS, segs: INDOIS_SEGS },
  "MMF-USD": { ks: MMFUSD_KS, is: MMFUSD_IS, segs: MMFUSD_SEGS },
  "MMF-IDR": { ks: MMFIDR_KS, is: MMFIDR_IS, segs: MMFIDR_SEGS },
  SPY: { ks: SPY_KS, is: SPY_IS, segs: SPY_SEGS },
  QQQ: { ks: QQQ_KS, is: QQQ_IS, segs: QQQ_SEGS },
  XIDX: { ks: XIDX_KS, is: XIDX_IS, segs: XIDX_SEGS },
  "005930.KS": { ks: SMSNG_KS, is: SMSNG_IS, segs: SMSNG_SEGS },
  ASML: { ks: ASML_KS, is: ASML_IS, segs: ASML_SEGS },
  "MC.PA": { ks: LVMH_KS, is: LVMH_IS, segs: LVMH_SEGS },
  "RMS.PA": { ks: HERMES_KS, is: HERMES_IS, segs: HERMES_SEGS },
  SHEL: { ks: SHELL_KS, is: SHELL_IS, segs: SHELL_SEGS },
  "NESN.SW": { ks: NESTLE_KS, is: NESTLE_IS, segs: NESTLE_SEGS },
  "7203.T": { ks: TOYOTA_KS, is: TOYOTA_IS, segs: TOYOTA_SEGS },
  SAP: { ks: SAP_KS, is: SAP_IS, segs: SAP_SEGS },
  "2318.HK": { ks: PINGAN_KS, is: PINGAN_IS, segs: PINGAN_SEGS },
  BABA: { ks: BABA_KS, is: BABA_IS, segs: BABA_SEGS },
  NVO: { ks: NOVO_KS, is: NOVO_IS, segs: NOVO_SEGS },
  "DBS.SI": { ks: DBS_KS, is: DBS_IS, segs: DBS_SEGS },
  SE: { ks: SE_KS, is: SE_IS, segs: SE_SEGS },
  GRAB: { ks: GRAB_KS, is: GRAB_IS, segs: GRAB_SEGS },
};

export function buildFallbackFinancials(
  asset: ResearchAsset,
): ReportFinancials {
  if (asset.assetClass === "stocks") {
    return buildSmallCapFinancials(asset);
  }

  if (asset.assetClass === "bonds") {
    return { ks: INDON_KS, is: INDON_IS, segs: INDON_SEGS };
  }

  if (asset.assetClass === "mmf") {
    if (asset.sector.toLowerCase().includes("usd")) {
      return { ks: MMFUSD_KS, is: MMFUSD_IS, segs: MMFUSD_SEGS };
    }
    return { ks: MMFIDR_KS, is: MMFIDR_IS, segs: MMFIDR_SEGS };
  }

  if (asset.assetClass === "us" || asset.assetClass === "global") {
    return buildIntlFallback(asset);
  }

  return {};
}
