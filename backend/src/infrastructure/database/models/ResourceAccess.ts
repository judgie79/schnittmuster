import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@config/database";

export type AccessRight = "read" | "write" | "delete";

export interface ResourceAccessAttributes {
  userId: string;
  resourceId: string;
  rights: AccessRight[];
  grantedBy?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ResourceAccessCreationAttributes = Optional<ResourceAccessAttributes, "grantedBy">;

export class ResourceAccess
  extends Model<ResourceAccessAttributes, ResourceAccessCreationAttributes>
  implements ResourceAccessAttributes
{
  public userId!: string;
  public resourceId!: string;
  public rights!: AccessRight[];
  public grantedBy!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ResourceAccess.init(
  {
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      field: "user_id",
    },
    resourceId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      field: "resource_id",
    },
    rights: {
      type: DataTypes.ARRAY(DataTypes.ENUM("read", "write", "delete")),
      allowNull: false,
    },
    grantedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "granted_by",
    },
  },
  {
    sequelize,
    tableName: "resource_access",
    timestamps: true,
    underscored: true,
  }
);
