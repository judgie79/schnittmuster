import type { TagDTO } from "./TagDTO";

export interface PatternDTO {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  filePath: string | null;
  thumbnailPath: string | null;
  fileStorageId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatternWithTagsDTO extends PatternDTO {
  tags: TagDTO[];
}

export interface PatternCreateDTO {
  name: string;
  description?: string | null;
  tagIds?: string[];
}

export interface PatternUpdateDTO {
  name?: string;
  description?: string | null;
  tagIds?: string[];
}
