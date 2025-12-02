import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@config/database";

export type AdminRoleName = "super_admin" | "admin" | "moderator";

interface AdminRoleAttributes {
  id: string;
  userId: string;
  role: AdminRoleName;
  assignedByUserId?: string | null;
  assignedAt?: Date;
}

export type AdminRoleCreationAttributes = Optional<AdminRoleAttributes, "id" | "assignedByUserId" | "assignedAt">;

export class AdminRole extends Model<AdminRoleAttributes, AdminRoleCreationAttributes> implements AdminRoleAttributes {
  public id!: string;
  public userId!: string;
  public role!: AdminRoleName;
  public assignedByUserId!: string | null;
  public assignedAt!: Date;
}

AdminRole.init(
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
    role: {
      type: DataTypes.ENUM("super_admin", "admin", "moderator"),
      allowNull: false,
    },
    assignedByUserId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "assigned_by_user_id",
    },
    assignedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "assigned_at",
    },
  },
  {
    sequelize,
    tableName: "admin_roles",
    timestamps: false,
    underscored: true,
  }
);

export default AdminRole;
