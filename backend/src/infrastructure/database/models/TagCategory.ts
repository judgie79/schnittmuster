import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@config/database";

export interface TagCategoryAttributes {
  id: string;
  name: string;
  displayOrder: number;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TagCategoryCreationAttributes = Optional<TagCategoryAttributes, "id" | "displayOrder">;

export class TagCategory
  extends Model<TagCategoryAttributes, TagCategoryCreationAttributes>
  implements TagCategoryAttributes
{
  public id!: string;
  public name!: string;
  public displayOrder!: number;
  public userId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TagCategory.init(
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
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "display_order",
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
    },
  },
  {
    sequelize,
    tableName: "tag_categories",
    timestamps: true,
    underscored: true,
  }
);
