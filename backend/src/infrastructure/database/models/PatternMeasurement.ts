import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@config/database";

export interface PatternMeasurementAttributes {
  id: string;
  patternId: string;
  measurementTypeId: string;
  value: number | null;
  notes: string | null;
  isRequired: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PatternMeasurementCreationAttributes = Optional<
  PatternMeasurementAttributes,
  "id" | "value" | "notes" | "isRequired"
>;

export class PatternMeasurement
  extends Model<PatternMeasurementAttributes, PatternMeasurementCreationAttributes>
  implements PatternMeasurementAttributes
{
  public id!: string;
  public patternId!: string;
  public measurementTypeId!: string;
  public value!: number | null;
  public notes!: string | null;
  public isRequired!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PatternMeasurement.init(
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
    measurementTypeId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "measurement_type_id",
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_required",
    },
  },
  {
    sequelize,
    tableName: "pattern_measurements",
    timestamps: true,
    underscored: true,
  }
);
