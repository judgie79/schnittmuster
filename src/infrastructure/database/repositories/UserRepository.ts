import { FindOptions, Op } from "sequelize";
import { User, UserCreationAttributes } from "@infrastructure/database/models/User";
import { NotFoundError } from "@shared/errors";

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return User.findByPk(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { email } });
  }

  async searchByUsername(query: string): Promise<User[]> {
    const options: FindOptions<User> = {
      where: {
        username: {
          [Op.iLike]: `%${query}%`,
        },
      },
      order: [["username", "ASC"]],
    };

    return User.findAll(options);
  }

  async create(data: UserCreationAttributes): Promise<User> {
    return User.create(data);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundError("User");
    }
    return user.update(data);
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundError("User");
    }
    await user.destroy();
  }
}
