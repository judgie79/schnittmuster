import jwt, { SignOptions } from "jsonwebtoken";
import { AuthRepository } from "./AuthRepository";
import { UserMapper } from "@shared/mappers";
import { UserDTO, UserCreateDTO } from "@shared/dtos";
import { validatePassword } from "@shared/validators/passwordValidator";
import { ValidationError, NotFoundError, ForbiddenError } from "@shared/errors";
import { authConfig } from "@config/auth";
import { environment } from "@config/environment";
import { User } from "@infrastructure/database/models/User";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  constructor(private readonly authRepository = new AuthRepository()) {}

  async register(data: UserCreateDTO): Promise<{ user: UserDTO; tokens: TokenPair }> {
    const passwordResult = validatePassword(data.password);
    if (!passwordResult.valid) {
      throw new ValidationError("Invalid password", passwordResult.errors);
    }

    const existing = await this.authRepository.findByEmail(data.email);
    if (existing) {
      throw new ValidationError("Email already in use");
    }

    const user = await this.authRepository.createUser({
      username: data.username,
      email: data.email,
      passwordHash: data.password,
      authProvider: "local",
    });

    const tokens = this.generateTokens(user);
    return { user: UserMapper.toDTO(user), tokens };
  }

  async login(email: string, password: string): Promise<{ user: UserDTO; tokens: TokenPair }> {
    const user = await this.authRepository.findByEmail(email);
    if (!user || !(await user.validatePassword(password))) {
      throw new ForbiddenError("Invalid credentials");
    }
    const tokens = this.generateTokens(user);
    return { user: UserMapper.toDTO(user), tokens };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    if (!refreshToken) {
      throw new ForbiddenError("Refresh token required");
    }

    try {
      const payload = jwt.verify(refreshToken, authConfig.jwt.refreshSecret) as { sub: string };
      const user = await this.authRepository.findByEmail(payload.sub);
      if (!user) {
        throw new NotFoundError("User");
      }
      return this.generateTokens(user);
    } catch {
      throw new ForbiddenError("Invalid refresh token");
    }
  }

  generateTokens(user: User): TokenPair {
    const accessOptions: SignOptions = {
      expiresIn: authConfig.jwt.accessExpiry as SignOptions["expiresIn"],
      issuer: "schnittmuster-manager",
      audience: environment.apiPrefix,
    };

    const accessToken = jwt.sign(
      {
        sub: user.email,
        userId: user.id,
        provider: user.authProvider,
      },
      authConfig.jwt.accessSecret,
      accessOptions
    );

    const refreshOptions: SignOptions = {
      expiresIn: authConfig.jwt.refreshExpiry as SignOptions["expiresIn"],
    };

    const refreshToken = jwt.sign(
      {
        sub: user.email,
        userId: user.id,
      },
      authConfig.jwt.refreshSecret,
      refreshOptions
    );

    return { accessToken, refreshToken };
  }

  async upsertOAuthUser(profile: { email: string; username: string }): Promise<User> {
    return this.authRepository.upsertOAuthUser(profile);
  }
}
