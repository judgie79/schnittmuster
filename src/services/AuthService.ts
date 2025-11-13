import bcryptjs from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { environment } from "../config/environment";
import { User } from "../models/User";
import { IUserCreateInput, IAuthResponse, IJwtPayload } from "../types";
import { UnauthorizedError, ConflictError } from "../utils/errors";

export class AuthService {
  static async register(data: IUserCreateInput): Promise<IAuthResponse> {
    // Check if user exists
    const existingUser = await User.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError("E-Mail-Adresse ist bereits registriert");
    }

    const existingUsername = await User.findByUsername(data.username);
    if (existingUsername) {
      throw new ConflictError("Benutzername ist bereits vergeben");
    }

    // Hash password
    const passwordHash = await bcryptjs.hash(data.password, 10);

    // Create user
    const user = await User.create({
      ...data,
      password_hash: passwordHash,
    });

    // Generate tokens
    return this.generateAuthResponse(user);
  }

  static async login(email: string, password: string): Promise<IAuthResponse> {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Ungültige Anmeldedaten");
    }

    const passwordMatch = await bcryptjs.compare(password, user.password_hash);
    if (!passwordMatch) {
      throw new UnauthorizedError("Ungültige Anmeldedaten");
    }

    return this.generateAuthResponse(user);
  }

  static generateToken(payload: IJwtPayload, secret: string, expiry: string): string {
    return jwt.sign(payload as any, secret as jwt.Secret, { expiresIn: expiry } as jwt.SignOptions) as string;
  }

  private static generateAuthResponse(user: any): IAuthResponse {
    const payload: IJwtPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    const accessToken = this.generateToken(
      payload,
      environment.jwt.secret,
      environment.jwt.expiry
    );

    const refreshToken = this.generateToken(
      payload,
      environment.jwt.refreshSecret,
      environment.jwt.refreshExpiry
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
      },
    };
  }
}
