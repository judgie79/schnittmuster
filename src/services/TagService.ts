import { Tag } from "../models/Tag";
import { NotFoundError } from "../utils/errors";

export class TagService {
  static async getAllCategories(): Promise<any[]> {
    return Tag.findAllCategories();
  }

  static async getCategoryWithTags(categoryId: number): Promise<any> {
    const category = await Tag.findCategoryById(categoryId);
    if (!category) {
      throw new NotFoundError("Tag-Kategorie");
    }

    const tags = await Tag.findTagsByCategory(categoryId);
    return { ...category, tags };
  }

  static async getTagsByCategory(categoryId: number): Promise<any[]> {
    const category = await Tag.findCategoryById(categoryId);
    if (!category) {
      throw new NotFoundError("Tag-Kategorie");
    }
    return Tag.findTagsByCategory(categoryId);
  }

  static async getTag(id: number): Promise<any> {
    const tag = await Tag.findTagById(id);
    if (!tag) {
      throw new NotFoundError("Tag");
    }
    return tag;
  }

  static async createTag(categoryId: number, name: string, color?: string): Promise<any> {
    const category = await Tag.findCategoryById(categoryId);
    if (!category) {
      throw new NotFoundError("Tag-Kategorie");
    }
    return Tag.createTag(categoryId, name, color);
  }

  static async deleteTag(id: number): Promise<void> {
    const tag = await Tag.findTagById(id);
    if (!tag) {
      throw new NotFoundError("Tag");
    }
    await Tag.deleteTag(id);
  }
}
