import { Op } from "sequelize";
import { Tag, TagCreationAttributes } from "@infrastructure/database/models/Tag";
import { TagCategory, TagCategoryCreationAttributes } from "@infrastructure/database/models/TagCategory";
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

  findCategoryById(id: string): Promise<TagCategory | null> {
    return TagCategory.findByPk(id);
  }

  async findByNameAndCategory(name: string, categoryId: string): Promise<Tag | null> {
    return Tag.findOne({
      where: {
        tagCategoryId: categoryId,
        name: { [Op.iLike]: name },
      },
    });
  }

  async findAllCategoriesWithTags(): Promise<TagCategory[]> {
    return TagCategory.findAll({
      include: [
        {
          model: Tag,
          as: "tags",
          separate: true,
          order: [["name", "ASC"]],
        },
      ],
      order: [
        ["displayOrder", "ASC"],
        ["name", "ASC"],
      ],
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

  createCategory(data: TagCategoryCreationAttributes): Promise<TagCategory> {
    return TagCategory.create(data);
  }

  async updateCategory(id: string, data: Partial<TagCategory>): Promise<TagCategory> {
    const category = await this.findCategoryById(id);
    if (!category) {
      throw new NotFoundError("Tag category");
    }
    return category.update(data);
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this.findCategoryById(id);
    if (!category) {
      throw new NotFoundError("Tag category");
    }
    await category.destroy();
  }
}
