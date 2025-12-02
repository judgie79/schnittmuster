import type { ISODateString, UUID } from './types';
import type { TagDTO } from './TagDTO';
export type PatternStatus = 'draft' | 'geplant' | 'genaeht' | 'getestet' | 'archiviert';
export interface PatternDTO {
    id: UUID;
    name: string;
    description?: string;
    thumbnailUrl?: string;
    fileUrl?: string;
    status: PatternStatus;
    isFavorite: boolean;
    tags: TagDTO[];
    ownerId: UUID;
    createdAt: ISODateString;
    updatedAt: ISODateString;
}
export interface PatternCreateDTO {
    name: string;
    description?: string;
    tagIds?: UUID[];
    fileUrl?: string;
    status?: PatternStatus;
    isFavorite?: boolean;
}
export interface PatternUpdateDTO {
    name?: string;
    description?: string;
    tagIds?: UUID[];
    fileUrl?: string;
    status?: PatternStatus;
    isFavorite?: boolean;
}
