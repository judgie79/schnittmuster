import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@config/database";

export type AdminNotificationType = "alert" | "warning" | "info" | "critical";

interface AdminNotificationAttributes {
  id: string;
  adminId: string;
  type: AdminNotificationType;
  title?: string | null;
  message?: string | null;
  relatedMetric?: string | null;
  read: boolean;
  createdAt?: Date;
}

export type AdminNotificationCreationAttributes = Optional<AdminNotificationAttributes, "id" | "title" | "message" | "relatedMetric" | "read" | "createdAt">;

export class AdminNotification
  extends Model<AdminNotificationAttributes, AdminNotificationCreationAttributes>
  implements AdminNotificationAttributes
{
  public id!: string;
  public adminId!: string;
  public type!: AdminNotificationType;
  public title!: string | null;
  public message!: string | null;
  public relatedMetric!: string | null;
  public read!: boolean;
  public createdAt!: Date;
}

AdminNotification.init(
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
    type: {
      type: DataTypes.ENUM("alert", "warning", "info", "critical"),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    relatedMetric: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "related_metric",
    },
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    tableName: "admin_notifications",
    timestamps: false,
    underscored: true,
  }
);

export default AdminNotification;
