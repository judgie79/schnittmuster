import { PatternStatus } from "@schnittmuster/dtos";

export interface PatternListFilters {
  query?: string;
  statuses?: PatternStatus[];
  favoriteOnly?: boolean;
  tagIds?: string[];
}
