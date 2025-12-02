import { User } from "@infrastructure/database/models/User";
import { UserDTO } from "@shared/dtos";

const toIsoString = (value?: Date): string => (value ? value.toISOString() : new Date().toISOString());
const toNullableIsoString = (value?: Date | null): string | null => (value ? value.toISOString() : null);

export class UserMapper {
  static toDTO(user: User): UserDTO {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      authProvider: user.authProvider,
      photoUrl: undefined,
      adminRole: user.adminRoleAssignment?.role,
      adminStatus: user.adminStatus,
      is2faEnabled: user.is2faEnabled,
      lastLogin: toNullableIsoString(user.lastLogin),
      createdAt: toIsoString(user.createdAt),
      updatedAt: toIsoString(user.updatedAt),
    };
  }

  static toDTOList(users: User[]): UserDTO[] {
    return users.map((user) => this.toDTO(user));
  }
}
