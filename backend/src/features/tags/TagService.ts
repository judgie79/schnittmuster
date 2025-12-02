import { TagRepository } from "@infrastructure/database/repositories/TagRepository";
import { TagMapper } from "@shared/mappers";
import { TagCategoryDTO, TagDTO } from "@shared/dtos";
import { AccessRight } from "schnittmuster-manager-dtos";
import { Tag } from "@infrastructure/database/models/Tag";
import { AccessControlService } from "@features/access-control/AccessControlService";

export class TagService {
  constructor(
    private readonly tagRepository = new TagRepository(),
    private readonly accessControlService = new AccessControlService()
  ) {}

  async list(): Promise<TagDTO[]> {
    const tags = await this.tagRepository.findAll();
    return TagMapper.toDTOList(tags);
  }

  async listCategories(): Promise<TagCategoryDTO[]> {
    const categories = await this.tagRepository.findAllCategoriesWithTags();
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

  private async assertTagPermissions(tagId: string, userId: string, rights: AccessRight[]): Promise<void> {
    const resource = await this.accessControlService.ensureResource("tag", tagId, userId);
    await this.accessControlService.assertHasRights(userId, resource.id, rights);
  }
}
