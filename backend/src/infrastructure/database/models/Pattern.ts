import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@config/database";
import type { PatternStatus } from "@schnittmuster/dtos";

export interface PatternAttributes {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  filePath: string | null;
  thumbnailPath: string | null;
  fileStorageId: string | null;
  status: PatternStatus;
  isFavorite: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PatternCreationAttributes = Optional<PatternAttributes, "id" | "description" | "filePath" | "thumbnailPath" | "fileStorageId" | "status" | "isFavorite">;

export class Pattern
  extends Model<PatternAttributes, PatternCreationAttributes>
  implements PatternAttributes
{
  public id!: string;
  public userId!: string;
  public name!: string;
  public description!: string | null;
  public filePath!: string | null;
  public thumbnailPath!: string | null;
  public fileStorageId!: string | null;
  public status!: PatternStatus;
  public isFavorite!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Pattern.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    filePath: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: "file_path",
    },
    thumbnailPath: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: "thumbnail_path",
    },
    fileStorageId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "file_storage_id",
    },
    status: {
      type: DataTypes.ENUM("draft", "geplant", "genaeht", "getestet", "archiviert"),
      allowNull: false,
      defaultValue: "draft",
    },
    isFavorite: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_favorite",
    },
  },
  {
    sequelize,
    tableName: "patterns",
    timestamps: true,
    underscored: true,
  }
);
