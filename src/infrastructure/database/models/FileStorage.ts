import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@config/database";

export interface FileStorageAttributes {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  fileData: Buffer;
  createdAt?: Date;
  updatedAt?: Date;
}

export type FileStorageCreationAttributes = Optional<FileStorageAttributes, "id">;

export class FileStorage
  extends Model<FileStorageAttributes, FileStorageCreationAttributes>
  implements FileStorageAttributes
{
  public id!: string;
  public fileName!: string;
  public mimeType!: string;
  public size!: number;
  public fileData!: Buffer;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FileStorage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "file_name",
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "mime_type",
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fileData: {
      type: DataTypes.BLOB("long"),
      allowNull: false,
      field: "file_data",
    },
  },
  {
    sequelize,
    tableName: "file_storage",
    timestamps: true,
    underscored: true,
  }
);
