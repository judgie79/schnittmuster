import { Pattern } from "@infrastructure/database/models/Pattern";
import { Tag } from "@infrastructure/database/models/Tag";
import { PatternTagProposal } from "@infrastructure/database/models/PatternTagProposal";
import { PatternDTO } from "@schnittmuster/dtos";
import { TagMapper } from "./TagMapper";
import { PatternTagProposalMapper } from "./PatternTagProposalMapper";
import { normalizeFilePathToDownloadUrl } from "@shared/utils/files";

const toIsoString = (value?: Date): string => (value ? value.toISOString() : new Date().toISOString());

const resolveTags = (pattern: Pattern, fallback?: Tag[]): Tag[] | undefined => {
  if (fallback) {
    return fallback;
  }
  return pattern.get("tags") as Tag[] | undefined;
};

const resolveTagProposals = (pattern: Pattern): PatternTagProposal[] | undefined => {
  return pattern.get("tagProposals") as PatternTagProposal[] | undefined;
};

export class PatternMapper {
  static toDTO(pattern: Pattern, preloadedTags?: Tag[]): PatternDTO {
    const tags = resolveTags(pattern, preloadedTags);
    const proposals = resolveTagProposals(pattern);

    return {
      id: pattern.id,
      name: pattern.name,
      description: pattern.description ?? undefined,
      thumbnailUrl: normalizeFilePathToDownloadUrl(pattern.thumbnailPath),
      fileUrl: normalizeFilePathToDownloadUrl(pattern.filePath),
      status: pattern.status,
      isFavorite: pattern.isFavorite,
      tags: tags ? TagMapper.toDTOList(tags) : [],
      ownerId: pattern.userId,
      createdAt: toIsoString(pattern.createdAt),
      updatedAt: toIsoString(pattern.updatedAt),
      proposedTags: proposals ? PatternTagProposalMapper.toDTOList(proposals) : undefined,
    };
  }

  static toDTOWithRelations(pattern: Pattern): PatternDTO {
    return this.toDTO(pattern);
  }

  static toDTOList(patterns: Pattern[]): PatternDTO[] {
    return patterns.map((pattern) => this.toDTO(pattern));
  }
}
