import { UserRepository } from "@infrastructure/database/repositories/UserRepository";
import { User, UserCreationAttributes } from "@infrastructure/database/models/User";

export class AuthRepository {
  constructor(private readonly userRepository = new UserRepository()) {}

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  createUser(data: UserCreationAttributes): Promise<User> {
    return this.userRepository.create(data);
  }

  updateUser(id: string, data: Partial<User>): Promise<User> {
    return this.userRepository.update(id, data);
  }

  async upsertOAuthUser(profile: { email: string; username: string }): Promise<User> {
    const existing = await this.findByEmail(profile.email);
    if (existing) {
      return existing;
    }
    return this.createUser({
      username: profile.username,
      email: profile.email,
      passwordHash: null,
      authProvider: "google",
    });
  }
}
