import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@config/database";
import type { MeasurementUnit, MeasurementCategory } from "@schnittmuster/dtos";

export interface MeasurementTypeAttributes {
  id: string;
  userId: string | null;
  name: string;
  description: string | null;
  unit: MeasurementUnit;
  category: MeasurementCategory;
  isSystemDefault: boolean;
  displayOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type MeasurementTypeCreationAttributes = Optional<
  MeasurementTypeAttributes,
  "id" | "userId" | "description" | "unit" | "category" | "isSystemDefault" | "displayOrder"
>;

export class MeasurementType
  extends Model<MeasurementTypeAttributes, MeasurementTypeCreationAttributes>
  implements MeasurementTypeAttributes
{
  public id!: string;
  public userId!: string | null;
  public name!: string;
  public description!: string | null;
  public unit!: MeasurementUnit;
  public category!: MeasurementCategory;
  public isSystemDefault!: boolean;
  public displayOrder!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MeasurementType.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "user_id",
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    unit: {
      type: DataTypes.ENUM("cm", "inch", "mm"),
      allowNull: false,
      defaultValue: "cm",
    },
    category: {
      type: DataTypes.ENUM("body", "garment", "custom"),
      allowNull: false,
      defaultValue: "custom",
    },
    isSystemDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_system_default",
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "display_order",
    },
  },
  {
    sequelize,
    tableName: "measurement_types",
    timestamps: true,
    underscored: true,
  }
);
