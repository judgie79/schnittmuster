import { User } from "@infrastructure/database/models/User";
import { UserDTO } from "@shared/dtos";

export class UserMapper {
  static toDTO(user: User): UserDTO {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      authProvider: user.authProvider,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toDTOList(users: User[]): UserDTO[] {
    return users.map((user) => this.toDTO(user));
  }
}
