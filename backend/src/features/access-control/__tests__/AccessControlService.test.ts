import { AccessControlService } from "../AccessControlService";
import { Resource } from "../../../infrastructure/database/models/Resource";
import { ResourceAccess } from "../../../infrastructure/database/models/ResourceAccess";
import { ForbiddenError } from "../../../shared/errors";

jest.mock("@infrastructure/database/models/Resource", () => ({
  Resource: {
    create: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    destroy: jest.fn(),
  },
}));

jest.mock("@infrastructure/database/models/ResourceAccess", () => ({
  ResourceAccess: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
}));

jest.mock("@shared/mappers", () => ({
  ResourceMapper: {
    toResourceDTO: jest.fn((resource: any) => ({
      id: resource.id,
      type: resource.type,
      ownerId: resource.ownerId,
      referenceId: resource.referenceId ?? undefined,
      createdAt: resource.createdAt?.toISOString?.() ?? new Date(0).toISOString(),
      updatedAt: resource.updatedAt?.toISOString?.() ?? new Date(0).toISOString(),
    })),
    toAccessDTO: jest.fn((access: any) => ({
      resourceId: access.resourceId,
      userId: access.userId,
      rights: [...access.rights],
      grantedBy: access.grantedBy ?? undefined,
      createdAt: access.createdAt?.toISOString?.() ?? new Date(0).toISOString(),
      updatedAt: access.updatedAt?.toISOString?.() ?? new Date(0).toISOString(),
    })),
    toAccessDTOList: jest.fn((entries: any[]) =>
      entries.map((entry) => ({
        resourceId: entry.resourceId,
        userId: entry.userId,
        rights: [...entry.rights],
        grantedBy: entry.grantedBy ?? undefined,
        createdAt: entry.createdAt?.toISOString?.() ?? new Date(0).toISOString(),
        updatedAt: entry.updatedAt?.toISOString?.() ?? new Date(0).toISOString(),
      }))
    ),
  },
}));

const mockedResource = Resource as unknown as jest.Mocked<Record<string, jest.Mock>>;
const mockedResourceAccess = ResourceAccess as unknown as jest.Mocked<Record<string, jest.Mock>>;

describe("AccessControlService", () => {
  const service = new AccessControlService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("merges access rights for existing grant", async () => {
    const entry = {
      resourceId: "res-1",
      userId: "user-1",
      rights: ["read"],
      grantedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      save: jest.fn().mockResolvedValue(undefined),
    } as any;

    mockedResourceAccess.findOne.mockResolvedValueOnce(entry);

    await service.grantAccess("res-1", "user-1", ["write", "read"], "admin-1");

    expect(entry.rights).toEqual(["read", "write"]);
    expect(entry.grantedBy).toBe("admin-1");
    expect(entry.save).toHaveBeenCalledTimes(1);
    expect(mockedResourceAccess.create).not.toHaveBeenCalled();
  });

  it("creates a new access entry when none exists", async () => {
    mockedResourceAccess.findOne.mockResolvedValueOnce(null);
    const created = {
      resourceId: "res-2",
      userId: "user-2",
      rights: ["read", "write"],
      grantedBy: "admin-2",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
    mockedResourceAccess.create.mockResolvedValueOnce(created);

    await service.grantAccess("res-2", "user-2", ["read", "write"], "admin-2");

    expect(mockedResourceAccess.create).toHaveBeenCalledWith({
      resourceId: "res-2",
      userId: "user-2",
      rights: ["read", "write"],
      grantedBy: "admin-2",
    });
  });

  it("allows resource owners to satisfy rights checks", async () => {
    mockedResource.findByPk.mockResolvedValueOnce({
      id: "res-3",
      ownerId: "owner-1",
      referenceId: "res-3",
    } as any);

    await expect(service.assertHasRights("owner-1", "res-3", ["delete"])).resolves.toBeUndefined();
    expect(mockedResourceAccess.findOne).not.toHaveBeenCalled();
  });

  it("throws when a user lacks the required access rights", async () => {
    mockedResource.findByPk.mockResolvedValueOnce({
      id: "res-4",
      ownerId: "owner-2",
    } as any);
    mockedResourceAccess.findOne.mockResolvedValueOnce({
      resourceId: "res-4",
      userId: "intruder",
      rights: ["read"],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    await expect(service.assertHasRights("intruder", "res-4", ["write"])).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("revokes existing access records", async () => {
    mockedResourceAccess.destroy.mockResolvedValueOnce(1 as any);

    await service.revokeAccess("res-5", "user-5");

    expect(mockedResourceAccess.destroy).toHaveBeenCalledWith({ where: { resourceId: "res-5", userId: "user-5" } });
  });
});
