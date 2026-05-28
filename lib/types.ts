export type RatingStatus = "OW+" | "OW" | "NT" | "UW" | "UW-";

export type AssetTab = "indonesia" | "us" | "global" | "bonds" | "mmf";

export type ResearchAssetClass = "stocks" | "us" | "global" | "bonds" | "mmf";
export type ResearchHorizon = "lt" | "mt" | "st";
export type ResearchStance = "ow" | "nt" | "uw";

export type Horizon = "long" | "medium" | "short";

export interface NavLink {
  href: string;
  label: string;
}

export interface SummaryStock {
  ticker: string;
  name: string;
  price: string;
  change: string;
  rank: number;
  score: number;
  status: RatingStatus;
  sector: string;
}

export interface ResearchHorizonData {
  prob: number;
  neg: number;
  ev: string;
  score: number;
  stance: ResearchStance;
}

export interface ResearchAsset {
  ticker: string;
  name: string;
  sector: string;
  color: string;
  logoUrl?: string | null;
  assetClass: ResearchAssetClass;
  price: string;
  change: string;
  fv: string;
  intlSector?: string | null;
  region?: string | null;
  isSmallCap?: boolean;
  lt: ResearchHorizonData;
  mt: ResearchHorizonData;
  st: ResearchHorizonData;
}

export interface ReportTag {
  label: string;
}

export interface KeyStat {
  label: string;
  value: string;
}

export interface IncomeStatementRow {
  item: string;
  values: string[];
  isBold?: boolean;
}

export interface SegmentItem {
  name: string;
  revenue: string;
  share: number;
  growth: string;
}

export interface RotationItem {
  status: RatingStatus;
  label: string;
  note: string;
}

export interface MacroDimension {
  title: string;
  score: string;
  trend: string;
  summary: string;
}

export interface InvestorStrategy {
  profile: string;
  badge: string;
  note: string;
  allocation: Array<{ label: string; value: number }>;
}
