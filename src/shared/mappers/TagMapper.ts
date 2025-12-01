import { Tag } from "@infrastructure/database/models/Tag";
import { TagCategory } from "@infrastructure/database/models/TagCategory";
import { TagCategoryDTO, TagDTO } from "@shared/dtos";

export class TagMapper {
  static toCategoryDTO(category: TagCategory): TagCategoryDTO {
    return {
      id: category.id,
      name: category.name,
      displayOrder: category.displayOrder,
    };
  }

  static toDTO(tag: Tag): TagDTO {
    return {
      id: tag.id,
      name: tag.name,
      colorHex: tag.colorHex,
      tagCategoryId: tag.tagCategoryId,
      category: tag.get("category")
        ? this.toCategoryDTO(tag.get("category") as TagCategory)
        : undefined,
    };
  }

  static toDTOList(tags: Tag[]): TagDTO[] {
    return tags.map((tag) => this.toDTO(tag));
  }
}
