import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@config/database";

export type MetricType = "server" | "database" | "api" | "storage";

interface SystemMetricAttributes {
  id: string;
  metricType: MetricType;
  metricData: Record<string, unknown> | null;
  collectedAt: Date;
}

export type SystemMetricCreationAttributes = Optional<SystemMetricAttributes, "id" | "collectedAt">;

export class SystemMetric extends Model<SystemMetricAttributes, SystemMetricCreationAttributes> implements SystemMetricAttributes {
  public id!: string;
  public metricType!: MetricType;
  public metricData!: Record<string, unknown> | null;
  public collectedAt!: Date;
}

SystemMetric.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    metricType: {
      type: DataTypes.ENUM("server", "database", "api", "storage"),
      allowNull: false,
      field: "metric_type",
    },
    metricData: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: "metric_data",
    },
    collectedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "collected_at",
    },
  },
  {
    sequelize,
    tableName: "system_metrics",
    timestamps: false,
    underscored: true,
  }
);

export default SystemMetric;
