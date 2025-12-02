import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@config/database";

export interface TagAttributes {
  id: string;
  name: string;
  colorHex: string;
  tagCategoryId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TagCreationAttributes = Optional<TagAttributes, "id">;

export class Tag extends Model<TagAttributes, TagCreationAttributes> implements TagAttributes {
  public id!: string;
  public name!: string;
  public colorHex!: string;
  public tagCategoryId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Tag.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    colorHex: {
      type: DataTypes.STRING(7),
      allowNull: false,
      validate: {
        is: /^#([0-9A-Fa-f]{6})$/,
      },
      field: "color_hex",
    },
    tagCategoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "tag_category_id",
    },
  },
  {
    sequelize,
    tableName: "tags",
    timestamps: true,
    underscored: true,
  }
);
