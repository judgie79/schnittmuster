import { TagRepository } from "@infrastructure/database/repositories/TagRepository";
import { TagMapper } from "@shared/mappers";
import { TagCategoryDTO, TagDTO } from "@schnittmuster/dtos";
import { AccessRight } from "@schnittmuster/dtos";
import { Tag } from "@infrastructure/database/models/Tag";
import { AccessControlService } from "@features/access-control/AccessControlService";
import { NotFoundError, ForbiddenError } from "@shared/errors";

export class TagService {
  constructor(
    private readonly tagRepository = new TagRepository(),
    private readonly accessControlService = new AccessControlService()
  ) {}

  async list(userId: string): Promise<TagDTO[]> {
    const tags = await this.tagRepository.findAll(userId);
    return TagMapper.toDTOList(tags);
  }

  async listCategories(userId: string): Promise<TagCategoryDTO[]> {
    const categories = await this.tagRepository.findAllCategoriesWithTags(userId);
    return categories.map((category) =>
      TagMapper.toCategoryDTO(category, {
        includeTags: true,
        tags: (category.get("tags") as Tag[] | undefined) ?? [],
      })
    );
  }

  async create(
    userId: string,
    payload: { name: string; tagCategoryId: string; colorHex: string }
  ): Promise<TagDTO> {
    const tag = await this.tagRepository.create(payload);
    await this.accessControlService.createResource({ id: tag.id, type: "tag", ownerId: userId, referenceId: tag.id });
    return TagMapper.toDTO(tag);
  }

  async update(
    id: string,
    userId: string,
    payload: Partial<{ name: string; colorHex: string; tagCategoryId: string }>
  ): Promise<TagDTO> {
    await this.assertTagPermissions(id, userId, ["write"]);
    const tag = await this.tagRepository.update(id, payload as any);
    return TagMapper.toDTO(tag);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.assertTagPermissions(id, userId, ["delete"]);
    await this.tagRepository.delete(id);
    await this.accessControlService.deleteResourcesByReference(id, "tag");
  }

  async createCategory(userId: string, payload: { name: string; displayOrder?: number }): Promise<TagCategoryDTO> {
    const category = await this.tagRepository.createCategory({ ...payload, userId });
    return TagMapper.toCategoryDTO(category);
  }

  async updateCategory(id: string, userId: string, payload: Partial<{ name: string; displayOrder: number }>): Promise<TagCategoryDTO> {
    await this.assertCategoryOwnership(id, userId);
    const category = await this.tagRepository.updateCategory(id, payload as any);
    return TagMapper.toCategoryDTO(category);
  }

  async removeCategory(id: string, userId: string): Promise<void> {
    await this.assertCategoryOwnership(id, userId);
    await this.tagRepository.deleteCategory(id);
  }

  private async assertTagPermissions(tagId: string, userId: string, rights: AccessRight[]): Promise<void> {
    const resource = await this.accessControlService.ensureResource("tag", tagId, userId);
    await this.accessControlService.assertHasRights(userId, resource.id, rights);
  }

  private async assertCategoryOwnership(categoryId: string, userId: string): Promise<void> {
    const category = await this.tagRepository.findCategoryById(categoryId);
    if (!category) {
      throw new NotFoundError("Tag category");
    }
    if (category.userId !== userId) {
      throw new ForbiddenError("You do not have permission to modify this category");
    }
  }
}
