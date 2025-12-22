import { Tag } from "@infrastructure/database/models/Tag";
import { TagCategory } from "@infrastructure/database/models/TagCategory";
import { TagCategoryDTO, TagDTO } from "@schnittmuster/dtos";

interface CategoryMapperOptions {
  includeTags?: boolean;
  tags?: Tag[];
}

export class TagMapper {
  static toCategoryDTO(category: TagCategory, options: CategoryMapperOptions = {}): TagCategoryDTO {
    const { includeTags = false, tags = [] } = options;
    return {
      id: category.id,
      name: category.name,
      displayOrder: category.displayOrder,
      userId: category.userId,
      tags: includeTags ? this.toDTOList(tags) : [],
    };
  }

  static toDTO(tag: Tag): TagDTO {
    const category = tag.get("category") as TagCategory | undefined;

    return {
      id: tag.id,
      name: tag.name,
      colorHex: tag.colorHex,
      categoryId: tag.tagCategoryId,
      categoryName: category?.name ?? "",
      category: category ? this.toCategoryDTO(category) : undefined,
    };
  }

  static toDTOList(tags: Tag[]): TagDTO[] {
    return tags.map((tag) => this.toDTO(tag));
  }
}
