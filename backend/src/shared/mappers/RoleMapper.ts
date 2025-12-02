import { Role } from "@infrastructure/database/models/Role";
import { RoleDTO } from "schnittmuster-manager-dtos";

const toIsoString = (value?: Date): string => (value ? value.toISOString() : new Date().toISOString());

export class RoleMapper {
  static toDTO(role: Role): RoleDTO {
    return {
      id: role.id,
      name: role.name,
      description: role.description ?? undefined,
      createdAt: toIsoString(role.createdAt),
      updatedAt: toIsoString(role.updatedAt),
    };
  }

  static toDTOList(roles: Role[]): RoleDTO[] {
    return roles.map((role) => this.toDTO(role));
  }
}
