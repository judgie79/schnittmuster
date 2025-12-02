import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@config/database";

export type FlaggedResourceType = "pattern" | "user" | "comment";
export type FlagReason = "spam" | "inappropriate" | "copyright" | "other";
export type FlagStatus = "pending" | "reviewed" | "approved" | "rejected";

interface FlaggedContentAttributes {
  id: string;
  resourceType: FlaggedResourceType;
  resourceId: string;
  flaggedByUserId?: string | null;
  reason: FlagReason;
  description?: string | null;
  status: FlagStatus;
  reviewedByAdminId?: string | null;
  reviewNotes?: string | null;
  reviewedAt?: Date | null;
  createdAt?: Date;
}

export type FlaggedContentCreationAttributes = Optional<FlaggedContentAttributes, "id" | "flaggedByUserId" | "description" | "status" | "reviewedByAdminId" | "reviewNotes" | "reviewedAt" | "createdAt">;

export class FlaggedContent
  extends Model<FlaggedContentAttributes, FlaggedContentCreationAttributes>
  implements FlaggedContentAttributes
{
  public id!: string;
  public resourceType!: FlaggedResourceType;
  public resourceId!: string;
  public flaggedByUserId!: string | null;
  public reason!: FlagReason;
  public description!: string | null;
  public status!: FlagStatus;
  public reviewedByAdminId!: string | null;
  public reviewNotes!: string | null;
  public reviewedAt!: Date | null;
  public createdAt!: Date;
}

FlaggedContent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    resourceType: {
      type: DataTypes.ENUM("pattern", "user", "comment"),
      allowNull: false,
      field: "resource_type",
    },
    resourceId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "resource_id",
    },
    flaggedByUserId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "flagged_by_user_id",
    },
    reason: {
      type: DataTypes.ENUM("spam", "inappropriate", "copyright", "other"),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "reviewed", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
    reviewedByAdminId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "reviewed_by_admin_id",
    },
    reviewNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "review_notes",
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "reviewed_at",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    sequelize,
    tableName: "flagged_content",
    timestamps: false,
    underscored: true,
  }
);

export default FlaggedContent;
