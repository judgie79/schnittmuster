import { Op } from "sequelize";
import { Resource } from "@infrastructure/database/models/Resource";
import { ResourceAccess } from "@infrastructure/database/models/ResourceAccess";
import { NotFoundError, ForbiddenError } from "@shared/errors";
import {
  AccessRight,
  ResourceDTO,
  ResourceAccessDTO,
  ResourceType,
} from "@schnittmuster/dtos";
import { ResourceMapper } from "@shared/mappers";

export interface CreateResourceParams {
  id?: string;
  type: ResourceType;
  ownerId: string;
  referenceId?: string;
}

export class AccessControlService {
  async createResource(params: CreateResourceParams): Promise<ResourceDTO> {
    const resource = await Resource.create({
      id: params.id,
      type: params.type,
      ownerId: params.ownerId,
      referenceId: params.referenceId ?? null,
    });
    return ResourceMapper.toResourceDTO(resource);
  }

  async ensureResource(
    type: ResourceType,
    referenceId: string,
    ownerId: string
  ): Promise<ResourceDTO> {
    const existing = await this.findResourceByReference(type, referenceId);
    if (existing) {
      return ResourceMapper.toResourceDTO(existing);
    }
    return this.createResource({ id: referenceId, type, ownerId, referenceId });
  }

  async findResourceByReference(type: ResourceType, referenceId: string): Promise<Resource | null> {
    return Resource.findOne({ where: { type, referenceId } });
  }

  async getResourceOrThrow(resourceId: string): Promise<Resource> {
    const resource = await Resource.findByPk(resourceId);
    if (!resource) {
      throw new NotFoundError("Resource");
    }
    return resource;
  }

  async grantAccess(
    resourceId: string,
    userId: string,
    rights: AccessRight[],
    grantedBy?: string
  ): Promise<ResourceAccessDTO> {
    const existing = await ResourceAccess.findOne({ where: { resourceId, userId } });
    const uniqueRights = Array.from(new Set([...(existing?.rights ?? []), ...rights]));
    if (existing) {
      existing.rights = uniqueRights as AccessRight[];
      existing.grantedBy = grantedBy ?? existing.grantedBy;
      await existing.save();
      return ResourceMapper.toAccessDTO(existing);
    }
    const created = await ResourceAccess.create({
      resourceId,
      userId,
      rights: uniqueRights as AccessRight[],
      grantedBy: grantedBy ?? null,
    });
    return ResourceMapper.toAccessDTO(created);
  }

  async revokeAccess(resourceId: string, userId: string): Promise<void> {
    await ResourceAccess.destroy({ where: { resourceId, userId } });
  }

  async setAccess(
    resourceId: string,
    userId: string,
    rights: AccessRight[],
    grantedBy?: string
  ): Promise<ResourceAccessDTO> {
    await ResourceAccess.destroy({ where: { resourceId, userId } });
    const created = await ResourceAccess.create({
      resourceId,
      userId,
      rights,
      grantedBy: grantedBy ?? null,
    });
    return ResourceMapper.toAccessDTO(created);
  }

  async getAccessEntries(resourceId: string): Promise<ResourceAccessDTO[]> {
    const entries = await ResourceAccess.findAll({ where: { resourceId } });
    return ResourceMapper.toAccessDTOList(entries);
  }

  async getUserAccessibleResources(userId: string): Promise<ResourceAccessDTO[]> {
    const entries = await ResourceAccess.findAll({ where: { userId } });
    return ResourceMapper.toAccessDTOList(entries);
  }

  async userHasRights(
    userId: string,
    resourceId: string,
    required: AccessRight[],
    allowOwner = true
  ): Promise<boolean> {
    const resource = await this.getResourceOrThrow(resourceId);
    if (allowOwner && resource.ownerId === userId) {
      return true;
    }
    if (!required.length) {
      return true;
    }
    const entry = await ResourceAccess.findOne({ where: { resourceId, userId } });
    if (!entry) {
      return false;
    }
    return required.every((right) => entry.rights.includes(right));
  }

  async assertHasRights(
    userId: string,
    resourceId: string,
    required: AccessRight[],
    allowOwner = true
  ): Promise<void> {
    const hasRights = await this.userHasRights(userId, resourceId, required, allowOwner);
    if (!hasRights) {
      throw new ForbiddenError("Insufficient permissions");
    }
  }

  async deleteResource(resourceId: string): Promise<void> {
    await ResourceAccess.destroy({ where: { resourceId } });
    await Resource.destroy({ where: { id: resourceId } });
  }

  async deleteResourcesByReference(referenceId: string, type: ResourceType): Promise<void> {
    const resources = await Resource.findAll({ where: { referenceId, type } });
    const ids = resources.map((resource) => resource.id);
    if (!ids.length) {
      return;
    }
    await ResourceAccess.destroy({ where: { resourceId: { [Op.in]: ids } } });
    await Resource.destroy({ where: { id: { [Op.in]: ids } } });
  }
}
