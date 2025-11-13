import { Pattern } from "../models/Pattern";
import { PatternTag } from "../models/PatternTag";
import { NotFoundError } from "../utils/errors";
import { IPatternCreateInput, IPatternWithTags } from "../types";

export class PatternService {
  static async createPattern(userId: number, data: IPatternCreateInput): Promise<any> {
    return Pattern.create(userId, data);
  }

  static async getPattern(id: number, userId: number): Promise<IPatternWithTags> {
    const pattern = await Pattern.findByIdWithTags(id, userId);
    if (!pattern) {
      throw new NotFoundError("Schnittmuster");
    }
    return pattern;
  }

  static async getAllPatterns(userId: number, limit = 50, offset = 0): Promise<any> {
    const patterns = await Pattern.findAllByUser(userId, limit, offset);
    const count = await Pattern.countByUser(userId);
    return { patterns, total: count };
  }

  static async updatePattern(id: number, userId: number, data: any): Promise<any> {
    const pattern = await Pattern.findById(id, userId);
    if (!pattern) {
      throw new NotFoundError("Schnittmuster");
    }
    return Pattern.update(id, userId, data);
  }

  static async deletePattern(id: number, userId: number): Promise<void> {
    const pattern = await Pattern.findById(id, userId);
    if (!pattern) {
      throw new NotFoundError("Schnittmuster");
    }
    await Pattern.delete(id, userId);
  }

  static async addTagsToPattern(patternId: number, userId: number, tagIds: number[]): Promise<void> {
    const pattern = await Pattern.findById(patternId, userId);
    if (!pattern) {
      throw new NotFoundError("Schnittmuster");
    }
    await PatternTag.addTags(patternId, tagIds);
  }

  static async removeTagFromPattern(patternId: number, userId: number, tagId: number): Promise<void> {
    const pattern = await Pattern.findById(patternId, userId);
    if (!pattern) {
      throw new NotFoundError("Schnittmuster");
    }
    await PatternTag.removeTag(patternId, tagId);
  }

  static async searchPatterns(userId: number, tagIds: number[], operator = "AND"): Promise<any[]> {
    return PatternTag.searchByTags(userId, tagIds, operator);
  }
}
