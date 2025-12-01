import { Pattern } from "@infrastructure/database/models/Pattern";
import { Tag } from "@infrastructure/database/models/Tag";
import { PatternDTO, PatternWithTagsDTO } from "@shared/dtos";
import { TagMapper } from "./TagMapper";

export class PatternMapper {
  static toDTO(pattern: Pattern): PatternDTO {
    return {
      id: pattern.id,
      userId: pattern.userId,
      name: pattern.name,
      description: pattern.description,
      filePath: pattern.filePath,
      thumbnailPath: pattern.thumbnailPath,
      fileStorageId: pattern.fileStorageId,
      createdAt: pattern.createdAt,
      updatedAt: pattern.updatedAt,
    };
  }

  static toDTOWithRelations(pattern: Pattern): PatternWithTagsDTO {
    const dto = this.toDTO(pattern);
    const tags = pattern.get("tags") as Tag[] | undefined;

    return {
      ...dto,
      tags: tags ? TagMapper.toDTOList(tags) : [],
    };
  }

  static toDTOList(patterns: Pattern[]): PatternDTO[] {
    return patterns.map((pattern) => this.toDTO(pattern));
  }
}
