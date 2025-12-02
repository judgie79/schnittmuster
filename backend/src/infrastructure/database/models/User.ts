import { DataTypes, Model, Optional } from "sequelize";
import bcrypt from "bcryptjs";
import { sequelize } from "@config/database";
import { AdminRole } from "./AdminRole";

export type AuthProvider = "local" | "google";
export type AdminStatus = "active" | "suspended" | "deleted";

export interface UserAttributes {
  id: string;
  username: string;
  email: string;
  passwordHash: string | null;
  authProvider: AuthProvider;
  adminStatus: AdminStatus;
  lastLogin?: Date | null;
  loginCount: number;
  failedLoginAttempts: number;
  lastFailedLogin?: Date | null;
  is2faEnabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserCreationAttributes = Optional<
  UserAttributes,
  "id" | "passwordHash" | "authProvider" | "adminStatus" | "loginCount" | "failedLoginAttempts" | "is2faEnabled"
>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public username!: string;
  public email!: string;
  public passwordHash!: string | null;
  public authProvider!: AuthProvider;
  public adminStatus!: AdminStatus;
  public lastLogin!: Date | null;
  public loginCount!: number;
  public failedLoginAttempts!: number;
  public lastFailedLogin!: Date | null;
  public is2faEnabled!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public adminRoleAssignment?: AdminRole;

  async validatePassword(password: string): Promise<boolean> {
    if (!this.passwordHash) {
      return false;
    }
    return bcrypt.compare(password, this.passwordHash);
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "password_hash",
    },
    authProvider: {
      type: DataTypes.ENUM("local", "google"),
      defaultValue: "local",
      allowNull: false,
      field: "auth_provider",
    },
    adminStatus: {
      type: DataTypes.ENUM("active", "suspended", "deleted"),
      allowNull: false,
      defaultValue: "active",
      field: "admin_status",
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_login",
    },
    loginCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "login_count",
    },
    failedLoginAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "failed_login_attempts",
    },
    lastFailedLogin: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_failed_login",
    },
    is2faEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_2fa_enabled",
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.passwordHash && !user.passwordHash.startsWith("$2")) {
          user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.passwordHash && !user.passwordHash.startsWith("$2")) {
          user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
        }
      },
    },
  }
);
