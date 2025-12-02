import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@config/database";

export interface UserRoleAttributes {
  userId: string;
  roleId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserRoleCreationAttributes = Optional<UserRoleAttributes, never>;

export class UserRole extends Model<UserRoleAttributes, UserRoleCreationAttributes> implements UserRoleAttributes {
  public userId!: string;
  public roleId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserRole.init(
  {
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      field: "user_id",
    },
    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      field: "role_id",
    },
  },
  {
    sequelize,
    tableName: "user_roles",
    timestamps: true,
    underscored: true,
  }
);
