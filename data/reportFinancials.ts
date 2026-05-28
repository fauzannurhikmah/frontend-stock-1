import {
  buildFallbackFinancials,
  buildSmallCapFinancials,
  extraReportFinancials,
} from "@/data/dummy/reportFinancialsData";
import { researchAssets } from "@/data/researchData";
import type { ResearchAsset } from "@/lib/types";

export type KsRow = {
  p: string;
  v?: string;
  g?: string | null;
  pos?: boolean | null;
  bold?: boolean;
  fc?: boolean;
  label?: string;
};

export type KsExtra = {
  mktCap: string;
  ev: string;
  shares: string;
  ff: string;
  peTTM?: string | null;
  pe26?: string | null;
};

export type KsData = {
  netIncome: KsRow[];
  eps: KsRow[];
  revenue: KsRow[];
  extra: KsExtra;
};

export type IsRow = {
  l: string;
  v: string[];
  bold?: boolean;
  hl?: boolean;
  neg?: boolean;
  sub?: boolean;
  fc?: boolean;
};

export type IsData = {
  cols: string[];
  rows: IsRow[];
};

export type SegRow = {
  l: string;
  v: string[];
  bold?: boolean;
  hl?: boolean;
  sub?: boolean;
  fc?: boolean;
};

export type SegItem = {
  name: string;
  rev: string;
  growth: string;
  pct: number;
  color: string;
  rows: SegRow[];
};

export type ReportFinancials = {
  ks?: KsData;
  is?: IsData;
  segs?: SegItem[];
};

function mkKS(
  netIncome: KsRow[],
  eps: KsRow[],
  revenue: KsRow[],
  extra: KsExtra,
): KsData {
  return { netIncome, eps, revenue, extra };
}

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

const BBCA_KS = mkKS(
  [
    qRow("Q1 2025", "14.146 B", "+9.8%", true),
    qRow("Q2 2025", "14.870 B", "+6.2%", true),
    qRow("Q3 2025", "14.381 B", "+1.3%", true),
    qRow("Q4 2025", "14.140 B", "+2.7%", true),
    qRow("Annualised", "57.537 B", "+5.0%", true, true),
    qRow("TTM (Q4)", "57.537 B", "+5.0%", true, true),
    {
      p: "FY 2026E",
      v: "62.430 B",
      g: "+8.5%",
      pos: true,
      bold: true,
      fc: true,
    },
    qRow("FY 2024", "54.836 B", "+13.6%", true),
    qRow("FY 2023", "48.639 B", "+19.2%", true),
    divRow("Dividen & Yield"),
    qRow("Div (TTM)", "336", null, null),
    qRow("Payout Ratio", "71.99%", null, null),
    qRow("Div Yield", "5.23%", null, null),
  ],
  [
    qRow("Q1 2025", "114.9", "+9.8%", true),
    qRow("Q2 2025", "120.8", "+6.2%", true),
    qRow("Q3 2025", "116.7", "+1.3%", true),
    qRow("Q4 2025", "114.8", "+2.7%", true),
    qRow("Annualised", "467.2", "+5.0%", true, true),
    { p: "FY 2026E", v: "506.4", g: "+8.4%", pos: true, bold: true, fc: true },
    qRow("FY 2024", "444.9", "+13.6%", true),
    qRow("FY 2023", "394.9", "+19.2%", true),
  ],
  [
    qRow("Q1 2025", "29.938 B", "+12.2%", true),
    qRow("Q2 2025", "30.616 B", "+8.4%", true),
    qRow("Q3 2025", "30.875 B", "+3.5%", true),
    qRow("Q4 2025", "27.144 B", "+1.8%", true),
    qRow("Annualised", "118.573 B", "+6.2%", true, true),
    {
      p: "FY 2026E",
      v: "128.140 B",
      g: "+8.1%",
      pos: true,
      bold: true,
      fc: true,
    },
    qRow("FY 2024", "111.633 B", "+14.1%", true),
    qRow("FY 2023", "97.834 B", "+21.8%", true),
  ],
  {
    mktCap: "1.208 T",
    ev: "-",
    shares: "123.28 B",
    ff: "42.59%",
    peTTM: "21.0x",
    pe26: "19.4x",
  },
);

const BBCA_IS: IsData = {
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
      v: [
        "128.140 B",
        "27.144 B",
        "30.875 B",
        "30.616 B",
        "29.938 B",
        "26.672 B",
        "29.824 B",
      ],
      bold: true,
      fc: true,
    },
    {
      l: "Beban Pokok Penjualan",
      v: [
        "(13.850 B)",
        "(3.325 B)",
        "(3.310 B)",
        "(3.481 B)",
        "(3.248 B)",
        "(3.177 B)",
        "(3.173 B)",
      ],
      neg: true,
      sub: true,
      fc: true,
    },
    {
      l: "Laba Kotor",
      v: [
        "114.290 B",
        "23.819 B",
        "27.565 B",
        "27.135 B",
        "26.690 B",
        "23.495 B",
        "26.652 B",
      ],
      bold: true,
      hl: true,
      fc: true,
    },
    {
      l: "Total Beban Usaha",
      v: [
        "(35.500 B)",
        "(6.325 B)",
        "(9.592 B)",
        "(8.797 B)",
        "(9.234 B)",
        "(6.123 B)",
        "(9.028 B)",
      ],
      neg: true,
      sub: true,
      fc: true,
    },
    {
      l: "Laba Usaha (EBIT)",
      v: [
        "78.790 B",
        "17.494 B",
        "17.973 B",
        "18.338 B",
        "17.456 B",
        "17.372 B",
        "17.624 B",
      ],
      bold: true,
      fc: true,
    },
    {
      l: "Beban Pajak Penghasilan",
      v: [
        "(16.360 B)",
        "(3.344 B)",
        "(3.583 B)",
        "(3.462 B)",
        "(3.309 B)",
        "(3.608 B)",
        "(3.413 B)",
      ],
      neg: true,
      sub: true,
      fc: true,
    },
    {
      l: "Laba Bersih Tahun Berjalan",
      v: [
        "62.430 B",
        "14.150 B",
        "14.390 B",
        "14.876 B",
        "14.147 B",
        "13.763 B",
        "14.210 B",
      ],
      bold: true,
      hl: true,
      fc: true,
    },
  ],
};

const BBCA_SEGS: SegItem[] = [
  {
    name: "Corporate Banking",
    rev: "42.8 T",
    growth: "+14.2%",
    pct: 36,
    color: "#3A9EE8",
    rows: [
      {
        l: "Pendapatan Bunga Korporasi",
        v: ["11.2 T", "12.4 T", "11.8 T", "11.1 T", "9.8 T", "11.0 T"],
        bold: true,
      },
      {
        l: "Fee & Komisi Korporasi",
        v: ["2.1 T", "2.3 T", "2.2 T", "2.0 T", "1.9 T", "2.1 T"],
        sub: true,
      },
      {
        l: "Total Segmen",
        v: ["13.3 T", "14.7 T", "14.0 T", "13.1 T", "11.7 T", "13.1 T"],
        bold: true,
        hl: true,
      },
      {
        l: "NPL Segmen",
        v: ["1.2%", "1.1%", "1.0%", "1.1%", "1.3%", "1.2%"],
        sub: true,
      },
    ],
  },
  {
    name: "Consumer Banking",
    rev: "38.5 T",
    growth: "+11.8%",
    pct: 32,
    color: "#22C97A",
    rows: [
      {
        l: "KPR & KPM",
        v: ["8.4 T", "9.1 T", "8.7 T", "8.2 T", "7.6 T", "8.3 T"],
        bold: true,
      },
      {
        l: "Kartu Kredit",
        v: ["3.2 T", "3.4 T", "3.3 T", "3.1 T", "2.9 T", "3.1 T"],
        sub: true,
      },
      {
        l: "Tabungan & CASA",
        v: ["4.1 T", "4.5 T", "4.3 T", "4.0 T", "3.7 T", "4.0 T"],
        sub: true,
      },
      {
        l: "Total Segmen",
        v: ["15.7 T", "17.0 T", "16.3 T", "15.3 T", "14.2 T", "15.4 T"],
        bold: true,
        hl: true,
      },
    ],
  },
  {
    name: "Digital & Treasury",
    rev: "28.3 T",
    growth: "+22.1%",
    pct: 24,
    color: "#9A72E8",
    rows: [
      {
        l: "myBCA (Digital)",
        v: ["3.8 T", "4.2 T", "4.0 T", "3.7 T", "2.9 T", "3.4 T"],
        bold: true,
      },
      {
        l: "Treasury & Money Market",
        v: ["2.9 T", "3.1 T", "3.0 T", "2.8 T", "2.6 T", "2.9 T"],
        sub: true,
      },
      {
        l: "Wholesale Digital",
        v: ["1.8 T", "2.0 T", "1.9 T", "1.7 T", "1.4 T", "1.8 T"],
        sub: true,
      },
      {
        l: "Total Segmen",
        v: ["8.5 T", "9.3 T", "8.9 T", "8.2 T", "6.9 T", "8.1 T"],
        bold: true,
        hl: true,
      },
    ],
  },
  {
    name: "MSME Banking",
    rev: "9.5 T",
    growth: "+8.4%",
    pct: 8,
    color: "#F0A030",
    rows: [
      {
        l: "Kredit UMKM",
        v: ["2.1 T", "2.3 T", "2.2 T", "2.0 T", "1.9 T", "2.1 T"],
        bold: true,
      },
      {
        l: "Tabungan Bisnis",
        v: ["0.8 T", "0.9 T", "0.8 T", "0.8 T", "0.7 T", "0.8 T"],
        sub: true,
      },
      {
        l: "Total Segmen",
        v: ["2.9 T", "3.2 T", "3.0 T", "2.8 T", "2.6 T", "2.9 T"],
        bold: true,
        hl: true,
      },
    ],
  },
];

function bankIS(scale: number): IsData {
  const base = BBCA_IS.rows;
  return {
    cols: BBCA_IS.cols,
    rows: base.map((row) => ({
      ...row,
      v: row.v.map((value) => {
        const neg = value.startsWith("(");
        const num = Number.parseFloat(value.replace(/[^0-9.]/g, ""));
        if (Number.isNaN(num)) {
          return value;
        }
        const out = (num * scale).toFixed(1);
        return neg ? `(${out} B)` : `${out} B`;
      }),
    })),
  };
}

const BMRI_KS = mkKS(
  [
    qRow("Q1 2025", "13.200 B", "+8.1%", true),
    qRow("Q2 2025", "14.100 B", "+9.3%", true),
    qRow("Q3 2025", "13.500 B", "+5.2%", true),
    qRow("Q4 2025", "13.750 B", "+6.8%", true),
    qRow("TTM", "54.550 B", "+7.4%", true, true),
    {
      p: "FY 2026E",
      v: "59.250 B",
      g: "+8.6%",
      pos: true,
      bold: true,
      fc: true,
    },
    qRow("FY 2024", "50.800 B", "+12.5%", true),
    qRow("FY 2023", "45.150 B", "+17.8%", true),
    divRow("Dividen & Yield"),
    qRow("Div (TTM)", "322", null, null),
    qRow("Payout Ratio", "60%", null, null),
    qRow("Div Yield", "6.2%", null, null),
  ],
  [
    qRow("Q1 2025", "141.2", "+8.1%", true),
    qRow("Q2 2025", "151.0", "+9.3%", true),
    qRow("Q3 2025", "144.5", "+5.2%", true),
    qRow("Q4 2025", "147.2", "+6.8%", true),
    qRow("FY 2024", "543.9", "+12.5%", true),
    qRow("FY 2023", "483.3", "+17.8%", true),
    { p: "FY 2026E", v: "634.8", g: "+8.6%", pos: true, bold: true, fc: true },
  ],
  [
    qRow("Q1 2025", "34.500 B", "+10.1%", true),
    qRow("Q2 2025", "35.800 B", "+11.2%", true),
    qRow("Q3 2025", "35.200 B", "+7.8%", true),
    qRow("Q4 2025", "34.900 B", "+9.1%", true),
    qRow("TTM", "140.400 B", "+9.6%", true, true),
    qRow("FY 2024", "128.100 B", "+13.2%", true),
    {
      p: "FY 2026E",
      v: "153.200 B",
      g: "+9.1%",
      pos: true,
      bold: true,
      fc: true,
    },
  ],
  {
    mktCap: "485 T",
    ev: "-",
    shares: "93.33 B",
    ff: "40.0%",
    peTTM: "8.9x",
    pe26: "8.2x",
  },
);

const BMRI_IS = bankIS(1.22);

const BMRI_SEGS: SegItem[] = [
  {
    name: "Wholesale Banking",
    rev: "58.2 T",
    growth: "+11.5%",
    pct: 40,
    color: "#3A9EE8",
    rows: [
      {
        l: "Pendapatan Bunga Korporasi",
        v: ["14.2 T", "15.1 T", "14.5 T", "14.0 T", "12.8 T", "13.5 T"],
        bold: true,
      },
      {
        l: "Fee Transaksional",
        v: ["2.5 T", "2.7 T", "2.6 T", "2.4 T", "2.2 T", "2.3 T"],
        sub: true,
      },
      {
        l: "Total Segmen",
        v: ["16.7 T", "17.8 T", "17.1 T", "16.4 T", "15.0 T", "15.8 T"],
        bold: true,
        hl: true,
      },
    ],
  },
  {
    name: "Retail Banking",
    rev: "43.8 T",
    growth: "+9.8%",
    pct: 30,
    color: "#22C97A",
    rows: [
      {
        l: "KPR & Auto",
        v: ["9.2 T", "9.8 T", "9.4 T", "9.0 T", "8.5 T", "9.0 T"],
        bold: true,
      },
      {
        l: "Konsumer & Kartu",
        v: ["3.1 T", "3.3 T", "3.2 T", "3.0 T", "2.8 T", "3.0 T"],
        sub: true,
      },
      {
        l: "Total Segmen",
        v: ["12.3 T", "13.1 T", "12.6 T", "12.0 T", "11.3 T", "12.0 T"],
        bold: true,
        hl: true,
      },
    ],
  },
  {
    name: "Digital (Livin)",
    rev: "29.5 T",
    growth: "+28.3%",
    pct: 20,
    color: "#9A72E8",
    rows: [
      {
        l: "Livin Transactions",
        v: ["6.2 T", "6.8 T", "6.5 T", "6.0 T", "4.8 T", "5.4 T"],
        bold: true,
      },
      {
        l: "Kopra Wholesale Digital",
        v: ["2.1 T", "2.3 T", "2.2 T", "2.0 T", "1.7 T", "1.9 T"],
        sub: true,
      },
      {
        l: "Total Segmen",
        v: ["8.3 T", "9.1 T", "8.7 T", "8.0 T", "6.5 T", "7.3 T"],
        bold: true,
        hl: true,
      },
    ],
  },
  {
    name: "Treasury & MSME",
    rev: "14.5 T",
    growth: "+6.2%",
    pct: 10,
    color: "#F0A030",
    rows: [
      {
        l: "Treasury",
        v: ["2.8 T", "3.0 T", "2.9 T", "2.7 T", "2.6 T", "2.8 T"],
        bold: true,
      },
      {
        l: "MSME Lending",
        v: ["1.3 T", "1.4 T", "1.35 T", "1.3 T", "1.2 T", "1.3 T"],
        sub: true,
      },
      {
        l: "Total Segmen",
        v: ["4.1 T", "4.4 T", "4.25 T", "4.0 T", "3.8 T", "4.1 T"],
        bold: true,
        hl: true,
      },
    ],
  },
];

const BBNI_KS = mkKS(
  [
    qRow("Q1 2025", "5.800 B", "+5.2%", true),
    qRow("Q2 2025", "6.100 B", "+7.1%", true),
    qRow("Q3 2025", "5.950 B", "+4.5%", true),
    qRow("Q4 2025", "5.850 B", "+3.8%", true),
    qRow("TTM", "23.700 B", "+5.2%", true, true),
    {
      p: "FY 2026E",
      v: "25.420 B",
      g: "+7.3%",
      pos: true,
      bold: true,
      fc: true,
    },
    qRow("FY 2024", "22.500 B", "+11.3%", true),
    qRow("FY 2023", "20.200 B", "+16.8%", true),
    divRow("Dividen & Yield"),
    qRow("Div (TTM)", "243", null, null),
    qRow("Payout Ratio", "50%", null, null),
    qRow("Div Yield", "5.5%", null, null),
  ],
  [
    qRow("Q1 2025", "155.5", "+5.2%", true),
    qRow("Q2 2025", "163.5", "+7.1%", true),
    qRow("Q3 2025", "159.5", "+4.5%", true),
    qRow("Q4 2025", "156.8", "+3.8%", true),
    qRow("FY 2024", "603.3", "+11.3%", true),
    { p: "FY 2026E", v: "681.5", g: "+7.3%", pos: true, bold: true, fc: true },
  ],
  [
    qRow("Q1 2025", "17.500 B", "+8.5%", true),
    qRow("Q2 2025", "18.200 B", "+9.2%", true),
    qRow("Q3 2025", "17.800 B", "+6.5%", true),
    qRow("Q4 2025", "17.400 B", "+7.1%", true),
    qRow("TTM", "70.900 B", "+7.8%", true, true),
    {
      p: "FY 2026E",
      v: "77.200 B",
      g: "+8.9%",
      pos: true,
      bold: true,
      fc: true,
    },
  ],
  {
    mktCap: "165 T",
    ev: "-",
    shares: "37.30 B",
    ff: "40.0%",
    peTTM: "7.0x",
    pe26: "6.5x",
  },
);

const BBNI_IS = bankIS(0.62);

const BBNI_SEGS: SegItem[] = [
  {
    name: "Corporate Banking",
    rev: "28.4 T",
    growth: "+9.2%",
    pct: 40,
    color: "#3A9EE8",
    rows: [
      {
        l: "Kredit Korporasi & BUMN",
        v: ["7.0 T", "7.4 T", "7.1 T", "6.8 T", "6.3 T", "6.7 T"],
        bold: true,
      },
      {
        l: "Fee Korporasi",
        v: ["1.2 T", "1.3 T", "1.25 T", "1.2 T", "1.1 T", "1.15 T"],
        sub: true,
      },
      {
        l: "Total Segmen",
        v: ["8.2 T", "8.7 T", "8.35 T", "8.0 T", "7.4 T", "7.85 T"],
        bold: true,
        hl: true,
      },
    ],
  },
  {
    name: "Retail & Consumer",
    rev: "21.3 T",
    growth: "+7.5%",
    pct: 30,
    color: "#22C97A",
    rows: [
      {
        l: "Kredit Konsumer & KPR",
        v: ["5.2 T", "5.5 T", "5.3 T", "5.0 T", "4.8 T", "5.0 T"],
        bold: true,
      },
      {
        l: "Kartu Kredit",
        v: ["1.0 T", "1.05 T", "1.0 T", "0.95 T", "0.9 T", "0.95 T"],
        sub: true,
      },
      {
        l: "Total Segmen",
        v: ["6.2 T", "6.55 T", "6.3 T", "5.95 T", "5.7 T", "5.95 T"],
        bold: true,
        hl: true,
      },
    ],
  },
  {
    name: "Digital (wondr)",
    rev: "14.2 T",
    growth: "+18.5%",
    pct: 20,
    color: "#9A72E8",
    rows: [
      {
        l: "wondr Transactions",
        v: ["3.0 T", "3.3 T", "3.15 T", "2.9 T", "2.4 T", "2.7 T"],
        bold: true,
      },
      {
        l: "Digital Lending",
        v: ["1.1 T", "1.2 T", "1.15 T", "1.05 T", "0.9 T", "1.0 T"],
        sub: true,
      },
      {
        l: "Total Segmen",
        v: ["4.1 T", "4.5 T", "4.3 T", "3.95 T", "3.3 T", "3.7 T"],
        bold: true,
        hl: true,
      },
    ],
  },
  {
    name: "Treasury",
    rev: "7.0 T",
    growth: "+4.8%",
    pct: 10,
    color: "#F0A030",
    rows: [
      {
        l: "FX & Money Market",
        v: ["1.5 T", "1.6 T", "1.55 T", "1.5 T", "1.4 T", "1.5 T"],
        bold: true,
      },
      {
        l: "Fixed Income",
        v: ["0.5 T", "0.55 T", "0.5 T", "0.5 T", "0.45 T", "0.5 T"],
        sub: true,
      },
      {
        l: "Total Segmen",
        v: ["2.0 T", "2.15 T", "2.05 T", "2.0 T", "1.85 T", "2.0 T"],
        bold: true,
        hl: true,
      },
    ],
  },
];

const TLKM_KS = mkKS(
  [
    qRow("Q1 2025", "6.200 B", "+3.2%", true),
    qRow("Q2 2025", "6.450 B", "+5.1%", true),
    qRow("Q3 2025", "6.100 B", "+2.1%", true),
    qRow("Q4 2025", "6.350 B", "+4.5%", true),
    qRow("TTM", "25.100 B", "+3.7%", true, true),
    {
      p: "FY 2026E",
      v: "26.350 B",
      g: "+5.0%",
      pos: true,
      bold: true,
      fc: true,
    },
    qRow("FY 2024", "24.200 B", "+8.5%", true),
    divRow("Dividen & Yield"),
    qRow("Div (TTM)", "126", null, null),
    qRow("Payout Ratio", "75%", null, null),
    qRow("Div Yield", "4.9%", null, null),
  ],
  [
    qRow("Q1 2025", "62.6", "+3.2%", true),
    qRow("Q2 2025", "65.1", "+5.1%", true),
    qRow("Q3 2025", "61.6", "+2.1%", true),
    qRow("Q4 2025", "64.1", "+4.5%", true),
    qRow("FY 2024", "244.4", "+8.5%", true),
    { p: "FY 2026E", v: "266.0", g: "+5.0%", pos: true, bold: true, fc: true },
  ],
  [
    qRow("Q1 2025", "36.500 B", "+2.5%", true),
    qRow("Q2 2025", "38.200 B", "+3.8%", true),
    qRow("Q3 2025", "37.100 B", "+1.5%", true),
    qRow("Q4 2025", "37.800 B", "+3.1%", true),
    qRow("TTM", "149.600 B", "+2.7%", true, true),
    {
      p: "FY 2026E",
      v: "156.500 B",
      g: "+4.6%",
      pos: true,
      bold: true,
      fc: true,
    },
  ],
  {
    mktCap: "311 T",
    ev: "340 T",
    shares: "99.06 B",
    ff: "47.5%",
    peTTM: "12.4x",
    pe26: "11.8x",
  },
);

const TLKM_IS: IsData = {
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
      v: [
        "156.500 B",
        "37.800 B",
        "37.100 B",
        "38.200 B",
        "36.500 B",
        "36.600 B",
        "36.500 B",
      ],
      bold: true,
      fc: true,
    },
    {
      l: "Beban Operasional",
      v: [
        "(79.500 B)",
        "(19.200 B)",
        "(18.800 B)",
        "(19.400 B)",
        "(18.500 B)",
        "(18.500 B)",
        "(18.400 B)",
      ],
      neg: true,
      sub: true,
      fc: true,
    },
    {
      l: "Laba Kotor",
      v: [
        "77.000 B",
        "18.600 B",
        "18.300 B",
        "18.800 B",
        "18.000 B",
        "18.100 B",
        "18.100 B",
      ],
      bold: true,
      hl: true,
      fc: true,
    },
    {
      l: "D&A",
      v: [
        "(32.200 B)",
        "(7.800 B)",
        "(7.600 B)",
        "(7.700 B)",
        "(7.500 B)",
        "(7.600 B)",
        "(7.500 B)",
      ],
      neg: true,
      sub: true,
      fc: true,
    },
    {
      l: "EBIT",
      v: [
        "44.800 B",
        "10.800 B",
        "10.700 B",
        "11.100 B",
        "10.500 B",
        "10.500 B",
        "10.600 B",
      ],
      bold: true,
      fc: true,
    },
    {
      l: "Beban Pajak",
      v: [
        "(10.400 B)",
        "(2.400 B)",
        "(2.600 B)",
        "(2.700 B)",
        "(2.500 B)",
        "(2.400 B)",
        "(2.400 B)",
      ],
      neg: true,
      sub: true,
      fc: true,
    },
    {
      l: "Laba Bersih Tahun Berjalan",
      v: [
        "26.350 B",
        "6.350 B",
        "6.100 B",
        "6.450 B",
        "6.200 B",
        "6.080 B",
        "5.970 B",
      ],
      bold: true,
      hl: true,
      fc: true,
    },
  ],
};

const TLKM_SEGS: SegItem[] = [
  {
    name: "Mobile (Telkomsel)",
    rev: "88.5 T",
    growth: "+1.2%",
    pct: 59,
    color: "#9A72E8",
    rows: [
      {
        l: "Voice & SMS",
        v: ["4.2 T", "4.3 T", "4.5 T", "4.4 T", "4.6 T", "4.7 T"],
        bold: true,
      },
      {
        l: "Data & Digital",
        v: ["17.8 T", "17.5 T", "18.0 T", "17.2 T", "17.0 T", "17.3 T"],
        sub: true,
      },
      {
        l: "Total Segmen",
        v: ["22.0 T", "21.8 T", "22.5 T", "21.6 T", "21.6 T", "22.0 T"],
        bold: true,
        hl: true,
      },
    ],
  },
  {
    name: "Indihome (FBB)",
    rev: "30.2 T",
    growth: "+5.5%",
    pct: 20,
    color: "#22C97A",
    rows: [
      {
        l: "Internet Home",
        v: ["6.8 T", "6.5 T", "6.6 T", "6.3 T", "6.0 T", "6.2 T"],
        bold: true,
      },
      {
        l: "TV & Add-ons",
        v: ["0.85 T", "0.82 T", "0.84 T", "0.80 T", "0.75 T", "0.78 T"],
        sub: true,
      },
      {
        l: "Total Segmen",
        v: ["7.65 T", "7.32 T", "7.44 T", "7.10 T", "6.75 T", "6.98 T"],
        bold: true,
        hl: true,
      },
    ],
  },
  {
    name: "Enterprise",
    rev: "19.5 T",
    growth: "+8.2%",
    pct: 13,
    color: "#3A9EE8",
    rows: [
      {
        l: "Connectivity",
        v: ["3.1 T", "3.0 T", "3.05 T", "2.9 T", "2.75 T", "2.85 T"],
        bold: true,
      },
      {
        l: "ICT Solutions",
        v: ["1.8 T", "1.75 T", "1.77 T", "1.70 T", "1.60 T", "1.65 T"],
        sub: true,
      },
      {
        l: "Total Segmen",
        v: ["4.9 T", "4.75 T", "4.82 T", "4.60 T", "4.35 T", "4.50 T"],
        bold: true,
        hl: true,
      },
    ],
  },
  {
    name: "Data Center & Cloud",
    rev: "12.0 T",
    growth: "+32.5%",
    pct: 8,
    color: "#5FB88A",
    rows: [
      {
        l: "Colocation & DC",
        v: ["2.2 T", "2.0 T", "1.9 T", "1.7 T", "1.4 T", "1.5 T"],
        bold: true,
      },
      {
        l: "Cloud & Managed",
        v: ["0.85 T", "0.78 T", "0.75 T", "0.68 T", "0.55 T", "0.60 T"],
        sub: true,
      },
      {
        l: "Total Segmen",
        v: ["3.05 T", "2.78 T", "2.65 T", "2.38 T", "1.95 T", "2.10 T"],
        bold: true,
        hl: true,
      },
    ],
  },
];

const ASII_KS = mkKS(
  [
    qRow("Q1 2025", "8.200 B", "+4.5%", true),
    qRow("Q2 2025", "8.600 B", "+6.2%", true),
    qRow("Q3 2025", "8.350 B", "+2.8%", true),
    qRow("Q4 2025", "8.450 B", "+3.5%", true),
    qRow("TTM", "33.600 B", "+4.3%", true, true),
    {
      p: "FY 2026E",
      v: "35.600 B",
      g: "+5.9%",
      pos: true,
      bold: true,
      fc: true,
    },
    qRow("FY 2024", "32.200 B", "+7.8%", true),
    divRow("Dividen & Yield"),
    qRow("Div (TTM)", "418", null, null),
    qRow("Payout Ratio", "50%", null, null),
    qRow("Div Yield", "8.7%", null, null),
  ],
  [
    qRow("Q1 2025", "202.5", "+4.5%", true),
    qRow("Q2 2025", "212.4", "+6.2%", true),
    qRow("Q3 2025", "206.3", "+2.8%", true),
    qRow("Q4 2025", "208.7", "+3.5%", true),
    qRow("FY 2024", "794.9", "+7.8%", true),
    { p: "FY 2026E", v: "879.4", g: "+5.9%", pos: true, bold: true, fc: true },
  ],
  [
    qRow("Q1 2025", "82.500 B", "+2.5%", true),
    qRow("Q2 2025", "85.200 B", "+3.8%", true),
    qRow("Q3 2025", "83.800 B", "+1.5%", true),
    qRow("Q4 2025", "84.100 B", "+2.8%", true),
    qRow("TTM", "335.600 B", "+2.7%", true, true),
    {
      p: "FY 2026E",
      v: "352.500 B",
      g: "+5.0%",
      pos: true,
      bold: true,
      fc: true,
    },
  ],
  {
    mktCap: "195 T",
    ev: "240 T",
    shares: "40.48 B",
    ff: "49.9%",
    peTTM: "5.8x",
    pe26: "5.5x",
  },
);

const ASII_IS: IsData = {
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
      v: [
        "352.500 B",
        "84.100 B",
        "83.800 B",
        "85.200 B",
        "82.500 B",
        "81.200 B",
        "82.500 B",
      ],
      bold: true,
      fc: true,
    },
    {
      l: "Beban Pokok Penjualan",
      v: [
        "(285.000 B)",
        "(68.200 B)",
        "(67.800 B)",
        "(68.900 B)",
        "(66.800 B)",
        "(65.800 B)",
        "(66.800 B)",
      ],
      neg: true,
      sub: true,
      fc: true,
    },
    {
      l: "Laba Kotor",
      v: [
        "67.500 B",
        "15.900 B",
        "16.000 B",
        "16.300 B",
        "15.700 B",
        "15.400 B",
        "15.700 B",
      ],
      bold: true,
      hl: true,
      fc: true,
    },
    {
      l: "Beban Usaha",
      v: [
        "(22.000 B)",
        "(5.200 B)",
        "(5.100 B)",
        "(5.300 B)",
        "(5.000 B)",
        "(4.950 B)",
        "(5.000 B)",
      ],
      neg: true,
      sub: true,
      fc: true,
    },
    {
      l: "EBIT",
      v: [
        "45.500 B",
        "10.700 B",
        "10.900 B",
        "11.000 B",
        "10.700 B",
        "10.450 B",
        "10.700 B",
      ],
      bold: true,
      fc: true,
    },
    {
      l: "Beban Pajak",
      v: [
        "(9.900 B)",
        "(2.250 B)",
        "(2.550 B)",
        "(2.400 B)",
        "(2.500 B)",
        "(2.280 B)",
        "(2.350 B)",
      ],
      neg: true,
      sub: true,
      fc: true,
    },
    {
      l: "Laba Bersih Tahun Berjalan",
      v: [
        "35.600 B",
        "8.450 B",
        "8.350 B",
        "8.600 B",
        "8.200 B",
        "8.170 B",
        "8.350 B",
      ],
      bold: true,
      hl: true,
      fc: true,
    },
  ],
};

const ASII_SEGS: SegItem[] = [
  {
    name: "Automotive",
    rev: "115 T",
    growth: "-2.5%",
    pct: 35,
    color: "#6B8DE8",
    rows: [
      {
        l: "4W (Toyota, Daihatsu)",
        v: ["22.5 T", "22.0 T", "22.8 T", "22.3 T", "23.1 T", "23.2 T"],
        bold: true,
      },
      {
        l: "2W (Honda)",
        v: ["6.2 T", "6.1 T", "6.3 T", "6.0 T", "6.2 T", "6.3 T"],
        sub: true,
      },
      {
        l: "Komponen",
        v: ["1.5 T", "1.48 T", "1.52 T", "1.45 T", "1.50 T", "1.52 T"],
        sub: true,
      },
      {
        l: "Total Segmen",
        v: ["30.2 T", "29.58 T", "30.62 T", "29.75 T", "30.80 T", "31.02 T"],
        bold: true,
        hl: true,
      },
    ],
  },
  {
    name: "Financial Services",
    rev: "42 T",
    growth: "+6.5%",
    pct: 13,
    color: "#3A9EE8",
    rows: [
      {
        l: "ACC & TAF (multifinance)",
        v: ["7.2 T", "7.1 T", "7.3 T", "7.0 T", "6.7 T", "6.9 T"],
        bold: true,
      },
      {
        l: "AsuransiAstra",
        v: ["3.4 T", "3.3 T", "3.5 T", "3.3 T", "3.1 T", "3.2 T"],
        sub: true,
      },
      {
        l: "Total Segmen",
        v: ["10.6 T", "10.4 T", "10.8 T", "10.3 T", "9.8 T", "10.1 T"],
        bold: true,
        hl: true,
      },
    ],
  },
  {
    name: "Heavy Equip & Mining",
    rev: "135 T",
    growth: "+9.2%",
    pct: 40,
    color: "#E8884A",
    rows: [
      {
        l: "UT (Komatsu)",
        v: ["25.8 T", "25.0 T", "26.0 T", "25.2 T", "23.5 T", "24.8 T"],
        bold: true,
      },
      {
        l: "Pama (mining contractor)",
        v: ["8.2 T", "8.0 T", "8.15 T", "7.9 T", "7.5 T", "7.8 T"],
        sub: true,
      },
      {
        l: "Total Segmen",
        v: ["34.0 T", "33.0 T", "34.15 T", "33.10 T", "31.00 T", "32.60 T"],
        bold: true,
        hl: true,
      },
    ],
  },
  {
    name: "Agribusiness & Infra",
    rev: "38 T",
    growth: "+12.0%",
    pct: 12,
    color: "#8AE84A",
    rows: [
      {
        l: "AALI (CPO)",
        v: ["6.8 T", "6.5 T", "6.7 T", "6.4 T", "5.9 T", "6.2 T"],
        bold: true,
      },
      {
        l: "Toll Road & Infra",
        v: ["2.4 T", "2.3 T", "2.35 T", "2.25 T", "2.1 T", "2.2 T"],
        sub: true,
      },
      {
        l: "Total Segmen",
        v: ["9.2 T", "8.8 T", "9.05 T", "8.65 T", "8.0 T", "8.4 T"],
        bold: true,
        hl: true,
      },
    ],
  },
];

const INDF_KS = mkKS(
  [
    qRow("Q1 2025", "3.200 B", "+9.8%", true),
    qRow("Q2 2025", "3.450 B", "+12.2%", true),
    qRow("Q3 2025", "3.300 B", "+8.5%", true),
    qRow("Q4 2025", "3.400 B", "+10.1%", true),
    qRow("TTM", "13.350 B", "+10.2%", true, true),
    {
      p: "FY 2026E",
      v: "14.680 B",
      g: "+10.0%",
      pos: true,
      bold: true,
      fc: true,
    },
    qRow("FY 2024", "12.100 B", "+15.8%", true),
    divRow("Dividen & Yield"),
    qRow("Div (TTM)", "315", null, null),
    qRow("Payout Ratio", "40%", null, null),
    qRow("Div Yield", "4.5%", null, null),
  ],
  [
    qRow("Q1 2025", "365.0", "+9.8%", true),
    qRow("Q2 2025", "393.5", "+12.2%", true),
    qRow("Q3 2025", "376.3", "+8.5%", true),
    qRow("Q4 2025", "387.7", "+10.1%", true),
    qRow("FY 2024", "1.380", "+15.8%", true),
    { p: "FY 2026E", v: "1.672", g: "+10.0%", pos: true, bold: true, fc: true },
  ],
  [
    qRow("Q1 2025", "24.800 B", "+5.2%", true),
    qRow("Q2 2025", "26.100 B", "+7.1%", true),
    qRow("Q3 2025", "25.400 B", "+3.8%", true),
    qRow("Q4 2025", "25.800 B", "+4.5%", true),
    qRow("TTM", "102.100 B", "+5.2%", true, true),
    {
      p: "FY 2026E",
      v: "108.500 B",
      g: "+6.3%",
      pos: true,
      bold: true,
      fc: true,
    },
  ],
  {
    mktCap: "61.6 T",
    ev: "75 T",
    shares: "8.78 B",
    ff: "49.9%",
    peTTM: "4.6x",
    pe26: "4.2x",
  },
);

const INDF_IS: IsData = {
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
      v: [
        "108.500 B",
        "25.800 B",
        "25.400 B",
        "26.100 B",
        "24.800 B",
        "24.700 B",
        "24.500 B",
      ],
      bold: true,
      fc: true,
    },
    {
      l: "Beban Pokok Penjualan",
      v: [
        "(78.500 B)",
        "(18.600 B)",
        "(18.400 B)",
        "(18.800 B)",
        "(18.000 B)",
        "(18.100 B)",
        "(18.000 B)",
      ],
      neg: true,
      sub: true,
      fc: true,
    },
    {
      l: "Laba Kotor",
      v: [
        "30.000 B",
        "7.200 B",
        "7.000 B",
        "7.300 B",
        "6.800 B",
        "6.600 B",
        "6.500 B",
      ],
      bold: true,
      hl: true,
      fc: true,
    },
    {
      l: "Beban Usaha",
      v: [
        "(10.000 B)",
        "(2.400 B)",
        "(2.350 B)",
        "(2.450 B)",
        "(2.300 B)",
        "(2.280 B)",
        "(2.250 B)",
      ],
      neg: true,
      sub: true,
      fc: true,
    },
    {
      l: "EBIT",
      v: [
        "20.000 B",
        "4.800 B",
        "4.650 B",
        "4.850 B",
        "4.500 B",
        "4.320 B",
        "4.250 B",
      ],
      bold: true,
      fc: true,
    },
    {
      l: "Beban Pajak",
      v: [
        "(4.350 B)",
        "(1.000 B)",
        "(1.050 B)",
        "(1.100 B)",
        "(950 B)",
        "(950 B)",
        "(900 B)",
      ],
      neg: true,
      sub: true,
      fc: true,
    },
    {
      l: "Laba Bersih Tahun Berjalan",
      v: [
        "14.680 B",
        "3.400 B",
        "3.300 B",
        "3.450 B",
        "3.200 B",
        "3.090 B",
        "3.040 B",
      ],
      bold: true,
      hl: true,
      fc: true,
    },
  ],
};

const INDF_SEGS: SegItem[] = [
  {
    name: "Produk Konsumen (CBP)",
    rev: "65 T",
    growth: "+7.2%",
    pct: 64,
    color: "#22C97A",
    rows: [
      {
        l: "Mie Instan (Indomie)",
        v: ["12.5 T", "12.2 T", "12.6 T", "12.0 T", "11.5 T", "11.8 T"],
        bold: true,
      },
      {
        l: "Dairy, Snack, Bumbu",
        v: ["3.8 T", "3.7 T", "3.85 T", "3.6 T", "3.4 T", "3.5 T"],
        sub: true,
      },
      {
        l: "Total Segmen",
        v: ["16.3 T", "15.9 T", "16.45 T", "15.6 T", "14.9 T", "15.3 T"],
        bold: true,
        hl: true,
      },
    ],
  },
  {
    name: "Bogasari (Tepung)",
    rev: "22 T",
    growth: "+2.8%",
    pct: 22,
    color: "#F0A030",
    rows: [
      {
        l: "Tepung Terigu",
        v: ["5.2 T", "5.1 T", "5.25 T", "5.0 T", "4.9 T", "5.0 T"],
        bold: true,
      },
      {
        l: "Pasta & Byproduct",
        v: ["0.45 T", "0.44 T", "0.45 T", "0.43 T", "0.42 T", "0.43 T"],
        sub: true,
      },
      {
        l: "Total Segmen",
        v: ["5.65 T", "5.54 T", "5.70 T", "5.43 T", "5.32 T", "5.43 T"],
        bold: true,
        hl: true,
      },
    ],
  },
  {
    name: "Agribusiness (SIMP/LSIP)",
    rev: "12 T",
    growth: "+4.5%",
    pct: 12,
    color: "#8AE84A",
    rows: [
      {
        l: "CPO Produksi",
        v: ["2.8 T", "2.7 T", "2.75 T", "2.65 T", "2.55 T", "2.6 T"],
        bold: true,
      },
      {
        l: "Rubber & Byproduct",
        v: ["0.30 T", "0.29 T", "0.30 T", "0.28 T", "0.27 T", "0.28 T"],
        sub: true,
      },
      {
        l: "Total Segmen",
        v: ["3.10 T", "2.99 T", "3.05 T", "2.93 T", "2.82 T", "2.88 T"],
        bold: true,
        hl: true,
      },
    ],
  },
  {
    name: "Distribusi",
    rev: "3.1 T",
    growth: "+6.5%",
    pct: 2,
    color: "#9A72E8",
    rows: [
      {
        l: "Distribusi Produk",
        v: ["0.82 T", "0.80 T", "0.81 T", "0.78 T", "0.75 T", "0.77 T"],
        bold: true,
      },
      {
        l: "Total Segmen",
        v: ["0.82 T", "0.80 T", "0.81 T", "0.78 T", "0.75 T", "0.77 T"],
        bold: true,
        hl: true,
      },
    ],
  },
];

const coreReportFinancials: Record<string, ReportFinancials> = {
  BBCA: { ks: BBCA_KS, is: BBCA_IS, segs: BBCA_SEGS },
  BMRI: { ks: BMRI_KS, is: BMRI_IS, segs: BMRI_SEGS },
  BBNI: { ks: BBNI_KS, is: BBNI_IS, segs: BBNI_SEGS },
  TLKM: { ks: TLKM_KS, is: TLKM_IS, segs: TLKM_SEGS },
  ASII: { ks: ASII_KS, is: ASII_IS, segs: ASII_SEGS },
  INDF: { ks: INDF_KS, is: INDF_IS, segs: INDF_SEGS },
};

const reportFinancials: Record<string, ReportFinancials> = {
  ...coreReportFinancials,
  ...extraReportFinancials,
};

const assetLookup = new Map<string, ResearchAsset>();
for (const asset of researchAssets) {
  if (!assetLookup.has(asset.ticker)) {
    assetLookup.set(asset.ticker, asset);
  }
}

export function getReportFinancials(ticker: string): ReportFinancials {
  const direct = reportFinancials[ticker];
  if (direct) return direct;

  const asset = assetLookup.get(ticker);
  if (!asset) return {};

  if (asset.isSmallCap) {
    return buildSmallCapFinancials(asset);
  }

  return buildFallbackFinancials(asset);
}
