import { PatternTag } from "@infrastructure/database/models/PatternTag";

export class PatternTagRepository {
  async attach(patternId: string, tagIds: string[]): Promise<void> {
    await PatternTag.destroy({ where: { patternId } });
    if (!tagIds.length) {
      return;
    }
    await PatternTag.bulkCreate(tagIds.map((tagId) => ({ patternId, tagId })), { ignoreDuplicates: true });
  }

  async detach(patternId: string, tagId: string): Promise<void> {
    await PatternTag.destroy({ where: { patternId, tagId } });
  }

  async findTagIds(patternId: string): Promise<string[]> {
    const patternTags = await PatternTag.findAll({ where: { patternId } });
    return patternTags.map((pt) => pt.tagId);
  }
}
