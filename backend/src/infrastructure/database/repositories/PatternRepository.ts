import { FindOptions, IncludeOptions, Op, WhereOptions } from "sequelize";
import { Pattern, PatternCreationAttributes } from "@infrastructure/database/models/Pattern";
import { Tag } from "@infrastructure/database/models/Tag";
import { PatternNote } from "@infrastructure/database/models/PatternNote";
import { NotFoundError } from "@shared/errors";
import { buildPaginationMeta } from "@shared/utils/helpers";
import { PaginatedResult } from "@shared/types";
import { TagCategory } from "@infrastructure/database/models/TagCategory";
import { User } from "@infrastructure/database/models/User";
import type { PatternListFilters } from "@features/patterns/types";

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

  async findAllPaginated(
    userId: string,
    page: number,
    pageSize: number,
    filters: PatternListFilters = {}
  ): Promise<PaginatedResult<Pattern>> {
    const offset = (page - 1) * pageSize;
    const where: WhereOptions = { userId };

    if (filters.query) {
      const like = `%${filters.query}%`;
      Object.assign(where, {
        [Op.or]: [{ name: { [Op.iLike]: like } }, { description: { [Op.iLike]: like } }],
      });
    }

    if (filters.statuses?.length) {
      Object.assign(where, { status: { [Op.in]: filters.statuses } });
    }

    if (filters.favoriteOnly) {
      Object.assign(where, { isFavorite: true });
    }

    const tagFilterEnabled = Boolean(filters.tagIds?.length);
    const include: IncludeOptions[] = [
      {
        model: Tag,
        as: "tags",
        through: { attributes: [] },
        required: tagFilterEnabled,
        where: tagFilterEnabled ? { id: { [Op.in]: filters.tagIds } } : undefined,
      },
    ];

    const { count, rows } = await Pattern.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order: [["createdAt", "DESC"]],
      distinct: true,
      include,
    });

    return {
      data: rows,
      pagination: buildPaginationMeta(page, pageSize, count),
    };
  }

  async create(data: PatternCreationAttributes, tagIds?: string[]): Promise<Pattern> {
    const pattern = await Pattern.create(data);
    if (tagIds?.length) {
      await this.setTagsAssociation(pattern, tagIds);
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
      await this.setTagsAssociation(pattern, tagIds);
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
    await this.setTagsAssociation(pattern, tagIds);
  }

  async findByFileIdentifier(identifier: string): Promise<Pattern | null> {
    const likePattern = `%${identifier}`;
    return Pattern.findOne({
      where: {
        [Op.or]: [
          { fileStorageId: identifier },
          { filePath: { [Op.iLike]: likePattern } },
          { thumbnailPath: { [Op.iLike]: likePattern } },
        ],
      },
    });
  }

  private async setTagsAssociation(pattern: Pattern, tagIds: string[]): Promise<void> {
    const instance = pattern as unknown as Record<string, unknown> & {
      setTags?: (ids: string[]) => Promise<void>;
      $set?: (association: string, ids: string[]) => Promise<void>;
    };

    if (typeof instance.setTags === "function") {
      await instance.setTags(tagIds);
      return;
    }

    if (typeof instance.$set === "function") {
      await instance.$set("tags", tagIds);
      return;
    }

    throw new Error("Pattern tags association is not configured correctly");
  }

  async getWithTags(id: string): Promise<Pattern | null> {
    return this.findById(id, {
      include: [
        { model: Tag, as: "tags" }
      ],
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
