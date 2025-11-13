import { User } from "../models/User";
import { NotFoundError } from "../utils/errors";
import { IUserResponse } from "../types";

export class UserService {
  static async getUser(id: number): Promise<IUserResponse> {
    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError("Benutzer");
    }

    const { password_hash, ...userResponse } = user;
    return userResponse;
  }

  static async getUserProfile(id: number): Promise<IUserResponse> {
    return this.getUser(id);
  }
}
