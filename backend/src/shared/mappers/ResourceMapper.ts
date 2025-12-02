import { Resource } from "@infrastructure/database/models/Resource";
import { ResourceAccess } from "@infrastructure/database/models/ResourceAccess";
import { ResourceDTO, ResourceAccessDTO } from "schnittmuster-manager-dtos";

const toIsoString = (value?: Date): string => (value ? value.toISOString() : new Date().toISOString());

export class ResourceMapper {
  static toResourceDTO(resource: Resource): ResourceDTO {
    return {
      id: resource.id,
      type: resource.type,
      ownerId: resource.ownerId,
      referenceId: resource.referenceId ?? undefined,
      createdAt: toIsoString(resource.createdAt),
      updatedAt: toIsoString(resource.updatedAt),
    };
  }

  static toResourceDTOList(resources: Resource[]): ResourceDTO[] {
    return resources.map((resource) => this.toResourceDTO(resource));
  }

  static toAccessDTO(access: ResourceAccess): ResourceAccessDTO {
    return {
      resourceId: access.resourceId,
      userId: access.userId,
      rights: access.rights,
      grantedBy: access.grantedBy ?? undefined,
      createdAt: toIsoString(access.createdAt),
      updatedAt: toIsoString(access.updatedAt),
    };
  }

  static toAccessDTOList(entries: ResourceAccess[]): ResourceAccessDTO[] {
    return entries.map((entry) => this.toAccessDTO(entry));
  }
}
