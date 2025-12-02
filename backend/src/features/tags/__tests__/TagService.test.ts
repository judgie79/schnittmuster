import { TagService } from "../TagService";
import { Tag } from "../../../infrastructure/database/models/Tag";
import { AccessControlService } from "../../access-control/AccessControlService";
import { TagRepository } from "../../../infrastructure/database/repositories/TagRepository";

const createTagEntity = (): Tag => {
  const tag = {
    id: "tag-1",
    name: "Sommer",
    colorHex: "#ffffff",
    tagCategoryId: "cat-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Tag & { get: (key: string) => unknown };

  tag.get = (key: string) => (tag as any)[key];
  return tag as Tag;
};

describe("TagService access control integration", () => {
  const buildService = () => {
    const repository: Partial<TagRepository> = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      findAllCategoriesWithTags: jest.fn(),
    };

    const accessControl: Partial<AccessControlService> = {
      createResource: jest.fn(),
      ensureResource: jest.fn().mockResolvedValue({ id: "resource-tag-1" } as any),
      assertHasRights: jest.fn(),
      deleteResourcesByReference: jest.fn(),
    };

    return {
      service: new TagService(repository as TagRepository, accessControl as AccessControlService),
      repository,
      accessControl,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("registers a resource when creating a tag", async () => {
    const { service, repository, accessControl } = buildService();
    (repository.create as jest.Mock).mockResolvedValue(createTagEntity());

    const payload = { name: "Sommer", tagCategoryId: "cat-1", colorHex: "#ffffff" };
    const dto = await service.create("admin-user", payload);

    expect(repository.create).toHaveBeenCalledWith(payload);
    expect(accessControl.createResource).toHaveBeenCalledWith({
      id: "tag-1",
      type: "tag",
      ownerId: "admin-user",
      referenceId: "tag-1",
    });
    expect(dto.id).toBe("tag-1");
  });

  it("enforces access control on update", async () => {
    const { service, repository, accessControl } = buildService();
    const updatedTag = createTagEntity();
    updatedTag.name = "Winter";
    (repository.update as jest.Mock).mockResolvedValue(updatedTag);

    const dto = await service.update("tag-1", "admin-user", { name: "Winter" });

    expect(accessControl.ensureResource).toHaveBeenCalledWith("tag", "tag-1", "admin-user");
    expect(accessControl.assertHasRights).toHaveBeenCalledWith("admin-user", "resource-tag-1", ["write"]);
    expect(repository.update).toHaveBeenCalledWith("tag-1", { name: "Winter" } as any);
    expect(dto.name).toBe("Winter");
  });

  it("removes associated resources when deleting a tag", async () => {
    const { service, repository, accessControl } = buildService();
    (accessControl.ensureResource as jest.Mock).mockResolvedValue({ id: "resource-tag-1" });
    (repository.delete as jest.Mock).mockResolvedValue(undefined);

    await expect(service.remove("tag-1", "admin-user")).resolves.toBeUndefined();

    expect(accessControl.ensureResource).toHaveBeenCalledWith("tag", "tag-1", "admin-user");
    expect(accessControl.assertHasRights).toHaveBeenCalledWith("admin-user", "resource-tag-1", ["delete"]);
    expect(repository.delete).toHaveBeenCalledWith("tag-1");
    expect(accessControl.deleteResourcesByReference).toHaveBeenCalledWith("tag-1", "tag");
  });
});
