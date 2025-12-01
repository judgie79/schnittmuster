import { DataTypes, Model } from "sequelize";
import { sequelize } from "@config/database";

export interface PatternTagAttributes {
  patternId: string;
  tagId: string;
}

export class PatternTag extends Model<PatternTagAttributes> implements PatternTagAttributes {
  public patternId!: string;
  public tagId!: string;
}

PatternTag.init(
  {
    patternId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      field: "pattern_id",
    },
    tagId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      field: "tag_id",
    },
  },
  {
    sequelize,
    tableName: "pattern_tags",
    timestamps: false,
    underscored: true,
  }
);
