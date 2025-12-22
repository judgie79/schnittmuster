import type { PatternStatus } from "@schnittmuster/dtos";

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
