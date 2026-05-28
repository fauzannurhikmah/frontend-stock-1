import { API_BASE_URL } from "@/lib/env";

export type SectorOption = { key: string; label: string };

let cachedSectorOptions: SectorOption[] | null = null;
let pendingSectorRequest: Promise<SectorOption[]> | null = null;

function normalizeSectorOption(item: unknown): SectorOption | null {
  if (typeof item === "string") {
    const key = item.trim().toLowerCase();
    if (!key) return null;
    return { key, label: item.trim() };
  }

  if (typeof item === "object" && item !== null) {
    const rawKey = (item as Record<string, unknown>).key;
    const rawCode = (item as Record<string, unknown>).code;
    const rawId = (item as Record<string, unknown>).id;
    const rawLabel = (item as Record<string, unknown>).label;
    const rawName = (item as Record<string, unknown>).name;

    const keyCandidate = [rawKey, rawCode, rawId]
      .find((value) => typeof value === "string" || typeof value === "number")
      ?.toString()
      .trim()
      .toLowerCase();
    const labelCandidate = [rawLabel, rawName, rawKey, rawCode, rawId]
      .find((value) => typeof value === "string" || typeof value === "number")
      ?.toString()
      .trim();

    if (!keyCandidate || !labelCandidate) return null;

    return { key: keyCandidate, label: labelCandidate };
  }

  return null;
}

function parseSectorsPayload(payload: unknown): SectorOption[] {
  const rawItems = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { data?: unknown })?.data)
      ? ((payload as { data: unknown[] }).data ?? [])
      : [];

  const normalized = rawItems
    .map(normalizeSectorOption)
    .filter((item): item is SectorOption => Boolean(item));

  const unique = new Map<string, SectorOption>();
  for (const item of normalized) {
    if (!unique.has(item.key)) unique.set(item.key, item);
  }
  return [...unique.values()];
}

export async function fetchSectors(): Promise<SectorOption[]> {
  const response = await fetch(`${API_BASE_URL}/sectors`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch sectors: HTTP ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  return parseSectorsPayload(payload);
}

export async function getSectorOptions(): Promise<SectorOption[]> {
  if (cachedSectorOptions) return cachedSectorOptions;
  if (pendingSectorRequest) return pendingSectorRequest;

  pendingSectorRequest = fetchSectors()
    .then((sectors) => {
      cachedSectorOptions = sectors;
      return sectors;
    })
    .finally(() => {
      pendingSectorRequest = null;
    });

  return pendingSectorRequest;
}
