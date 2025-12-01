import { FindOptions } from "sequelize";
import { Pattern, PatternCreationAttributes } from "@infrastructure/database/models/Pattern";
import { Tag } from "@infrastructure/database/models/Tag";
import { PatternNote } from "@infrastructure/database/models/PatternNote";
import { NotFoundError } from "@shared/errors";
import { buildPaginationMeta } from "@shared/utils/helpers";
import { PaginatedResult } from "@shared/types";

export class PatternRepository {
  async findById(id: string, options?: FindOptions<Pattern>): Promise<Pattern | null> {
    return Pattern.findByPk(id, options);
  }

  async findByUser(userId: string): Promise<Pattern[]> {
    return Pattern.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
  }

  async findAllPaginated(userId: string, page: number, pageSize: number): Promise<PaginatedResult<Pattern>> {
    const offset = (page - 1) * pageSize;
    const { count, rows } = await Pattern.findAndCountAll({
      where: { userId },
      limit: pageSize,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      data: rows,
      pagination: buildPaginationMeta(page, pageSize, count),
    };
  }

  async create(data: PatternCreationAttributes, tagIds?: string[]): Promise<Pattern> {
    const pattern = await Pattern.create(data);
    if (tagIds?.length) {
      await (pattern as any).$set("tags", tagIds);
    }
    return pattern;
  }

  async update(id: string, data: Partial<Pattern>, tagIds?: string[]): Promise<Pattern> {
    const pattern = await this.findById(id);
    if (!pattern) {
      throw new NotFoundError("Pattern");
    }
    await pattern.update(data);
    if (tagIds) {
      await (pattern as any).$set("tags", tagIds);
    }
    return pattern;
  }

  async delete(id: string): Promise<void> {
    const pattern = await this.findById(id);
    if (!pattern) {
      throw new NotFoundError("Pattern");
    }
    await pattern.destroy();
  }

  async addNote(patternId: string, noteText: string): Promise<PatternNote> {
    return PatternNote.create({ patternId, noteText });
  }

  async getNotes(patternId: string): Promise<PatternNote[]> {
    return PatternNote.findAll({
      where: { patternId },
      order: [["createdAt", "DESC"]],
    });
  }

  async attachTags(patternId: string, tagIds: string[]): Promise<void> {
    const pattern = await this.findById(patternId);
    if (!pattern) {
      throw new NotFoundError("Pattern");
    }
    await (pattern as any).$set("tags", tagIds);
  }

  async getWithTags(id: string): Promise<Pattern | null> {
    return this.findById(id, {
      include: [{ model: Tag, as: "tags" }],
    });
  }

  async getWithTagsAndNotes(id: string): Promise<Pattern | null> {
    return this.findById(id, {
      include: [
        { model: Tag, as: "tags" },
        { model: PatternNote, as: "notes" },
      ],
    });
  }
}
