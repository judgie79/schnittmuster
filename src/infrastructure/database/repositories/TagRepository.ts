import { Tag, TagCreationAttributes } from "@infrastructure/database/models/Tag";
import { TagCategory } from "@infrastructure/database/models/TagCategory";
import { NotFoundError } from "@shared/errors";

export class TagRepository {
  async findAll(): Promise<Tag[]> {
    return Tag.findAll({ include: [{ model: TagCategory, as: "category" }], order: [["name", "ASC"]] });
  }

  async findById(id: string): Promise<Tag | null> {
    return Tag.findByPk(id, { include: [{ model: TagCategory, as: "category" }] });
  }

  async findByCategory(categoryId: string): Promise<Tag[]> {
    return Tag.findAll({
      where: { tagCategoryId: categoryId },
      order: [["name", "ASC"]],
    });
  }

  async create(data: TagCreationAttributes): Promise<Tag> {
    return Tag.create(data);
  }

  async update(id: string, data: Partial<Tag>): Promise<Tag> {
    const tag = await this.findById(id);
    if (!tag) {
      throw new NotFoundError("Tag");
    }
    return tag.update(data);
  }

  async delete(id: string): Promise<void> {
    const tag = await this.findById(id);
    if (!tag) {
      throw new NotFoundError("Tag");
    }
    await tag.destroy();
  }
}
