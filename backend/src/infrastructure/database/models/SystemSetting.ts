import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@config/database";

export type SettingDataType = "string" | "number" | "boolean" | "json";

interface SystemSettingAttributes {
  id: string;
  key: string;
  value: Record<string, unknown> | null;
  dataType: SettingDataType;
  updatedByAdminId?: string | null;
  updatedAt?: Date;
}

export type SystemSettingCreationAttributes = Optional<SystemSettingAttributes, "id" | "updatedByAdminId" | "updatedAt">;

export class SystemSetting extends Model<SystemSettingAttributes, SystemSettingCreationAttributes> implements SystemSettingAttributes {
  public id!: string;
  public key!: string;
  public value!: Record<string, unknown> | null;
  public dataType!: SettingDataType;
  public updatedByAdminId!: string | null;
  public updatedAt!: Date;
}

SystemSetting.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    dataType: {
      type: DataTypes.ENUM("string", "number", "boolean", "json"),
      allowNull: false,
      defaultValue: "json",
      field: "data_type",
    },
    updatedByAdminId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "updated_by_admin_id",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "updated_at",
    },
  },
  {
    sequelize,
    tableName: "system_settings",
    timestamps: false,
    underscored: true,
  }
);

export default SystemSetting;
