import type { BusinessCategory, LocationRecord, TermPattern } from "@/lib/types";

export const GENERATION_LIMIT_OPTIONS = [1000, 5000, 10000, 50000] as const;
export const BATCH_SIZE = 500;

export type GeneratedTermDraft = {
  term: string;
  category_id: string;
  location_id: string;
  pattern_id: string;
};

export function normalizeGeneratedTerm(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

export function buildGeneratedDrafts(
  categories: BusinessCategory[],
  locations: LocationRecord[],
  patterns: TermPattern[],
  limit: number
) {
  const drafts: GeneratedTermDraft[] = [];
  const seen = new Set<string>();

  for (const category of categories) {
    for (const location of locations) {
      for (const pattern of patterns) {
        const term = normalizeGeneratedTerm(
          pattern.pattern.replace("{category}", category.name).replace("{location}", location.name)
        );

        if (!term || seen.has(term)) {
          continue;
        }

        drafts.push({
          term,
          category_id: category.id,
          location_id: location.id,
          pattern_id: pattern.id
        });
        seen.add(term);

        if (drafts.length >= limit) {
          return drafts;
        }
      }
    }
  }

  return drafts;
}

export function splitIntoBatches<T>(items: T[], batchSize = BATCH_SIZE) {
  const batches: T[][] = [];

  for (let index = 0; index < items.length; index += batchSize) {
    batches.push(items.slice(index, index + batchSize));
  }

  return batches;
}

export function parseCsvText(csvText: string) {
  return csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(",").map((cell) => cell.trim().replace(/^"|"$/g, "")));
}

export function parseBoolean(value: string | undefined, fallback = true) {
  if (!value) {
    return fallback;
  }

  return ["true", "1", "yes", "y", "active"].includes(value.trim().toLowerCase());
}
