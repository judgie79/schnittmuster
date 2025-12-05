import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@config/database";

export type TagProposalStatus = "pending" | "approved" | "rejected";

export interface PatternTagProposalAttributes {
  id: string;
  patternId: string;
  userId: string;
  tagCategoryId: string;
  name: string;
  colorHex: string;
  status: TagProposalStatus;
  tagId?: string | null;
  approvedByUserId?: string | null;
  approvedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PatternTagProposalCreationAttributes = Optional<
  PatternTagProposalAttributes,
  "id" | "status" | "tagId" | "approvedByUserId" | "approvedAt"
>;

export class PatternTagProposal
  extends Model<PatternTagProposalAttributes, PatternTagProposalCreationAttributes>
  implements PatternTagProposalAttributes
{
  declare id: string;
  declare patternId: string;
  declare userId: string;
  declare tagCategoryId: string;
  declare name: string;
  declare colorHex: string;
  declare status: TagProposalStatus;
  declare tagId?: string | null;
  declare approvedByUserId?: string | null;
  declare approvedAt?: Date | null;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;
}

PatternTagProposal.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    patternId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "pattern_id",
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
    },
    tagCategoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "tag_category_id",
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    colorHex: {
      type: DataTypes.STRING(7),
      allowNull: false,
      field: "color_hex",
      validate: {
        is: /^#([0-9A-Fa-f]{6})$/,
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
    tagId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "tag_id",
    },
    approvedByUserId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "approved_by_user_id",
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "approved_at",
    },
  },
  {
    sequelize,
    tableName: "pattern_tag_proposals",
    timestamps: true,
    underscored: true,
  }
);
