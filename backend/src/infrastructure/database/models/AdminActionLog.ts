import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@config/database";

export type AdminActionType =
  | "user_suspend"
  | "user_activate"
  | "user_delete"
  | "user_role_change"
  | "pattern_delete"
  | "setting_change";

export type AdminActionStatus = "success" | "failure";

interface AdminActionLogAttributes {
  id: string;
  adminId: string;
  action: AdminActionType;
  targetUserId?: string | null;
  targetResourceId?: string | null;
  changes?: Record<string, unknown> | null;
  reason?: string | null;
  status: AdminActionStatus;
  errorMessage?: string | null;
  createdAt?: Date;
}

export type AdminActionLogCreationAttributes = Optional<AdminActionLogAttributes, "id" | "status" | "createdAt">;

export class AdminActionLog
  extends Model<AdminActionLogAttributes, AdminActionLogCreationAttributes>
  implements AdminActionLogAttributes
{
  public id!: string;
  public adminId!: string;
  public action!: AdminActionType;
  public targetUserId!: string | null;
  public targetResourceId!: string | null;
  public changes!: Record<string, unknown> | null;
  public reason!: string | null;
  public status!: AdminActionStatus;
  public errorMessage!: string | null;
  public createdAt!: Date;
}

AdminActionLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    adminId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "admin_id",
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    targetUserId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "target_user_id",
    },
    targetResourceId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "target_resource_id",
    },
    changes: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("success", "failure"),
      allowNull: false,
      defaultValue: "success",
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "error_message",
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
    tableName: "admin_action_logs",
    timestamps: false,
    underscored: true,
  }
);

export default AdminActionLog;
