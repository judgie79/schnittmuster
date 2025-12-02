import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@config/database";

export type ResourceType = "pattern" | "tag" | "file";

export interface ResourceAttributes {
  id: string;
  type: ResourceType;
  ownerId: string;
  referenceId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ResourceCreationAttributes = Optional<ResourceAttributes, "id" | "referenceId">;

export class Resource extends Model<ResourceAttributes, ResourceCreationAttributes> implements ResourceAttributes {
  public id!: string;
  public type!: ResourceType;
  public ownerId!: string;
  public referenceId!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Resource.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM("pattern", "tag", "file"),
      allowNull: false,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "owner_id",
    },
    referenceId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "reference_id",
    },
  },
  {
    sequelize,
    tableName: "resources",
    timestamps: true,
    underscored: true,
  }
);
