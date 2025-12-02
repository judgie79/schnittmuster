import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@config/database";

export type RoleName = "user" | "editor" | "admin";

export interface RoleAttributes {
  id: string;
  name: RoleName | string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type RoleCreationAttributes = Optional<RoleAttributes, "id" | "description">;

export class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public id!: string;
  public name!: RoleName | string;
  public description!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Role.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.ENUM("user", "editor", "admin"),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "roles",
    timestamps: true,
    underscored: true,
  }
);
