import type { PatternStatus } from "@shared/dtos";

export interface PatternListFilters {
  query?: string;
  statuses?: PatternStatus[];
  favoriteOnly?: boolean;
  tagIds?: string[];
}

export const PATTERN_STATUS_VALUES: PatternStatus[] = [
  "draft",
  "geplant",
  "genaeht",
  "getestet",
  "archiviert",
];

export const TAG_FILTER_PARAM_KEYS = ["zielgruppe", "kleidungsart", "hersteller", "lizenz", "groesse"] as const;
export type TagFilterParamKey = (typeof TAG_FILTER_PARAM_KEYS)[number];
