import { DataTypes, QueryInterface } from "sequelize";

const TABLE = "patterns";
const STATUS_COLUMN = "status";
const FAVORITE_COLUMN = "is_favorite";
const STATUS_ENUM = "enum_patterns_status";
const STATUS_VALUES = ["draft", "geplant", "genaeht", "getestet", "archiviert"] as const;

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addColumn(TABLE, STATUS_COLUMN, {
    type: DataTypes.ENUM(...STATUS_VALUES),
    allowNull: false,
    defaultValue: "draft",
  });

  await queryInterface.addColumn(TABLE, FAVORITE_COLUMN, {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn(TABLE, FAVORITE_COLUMN);
  await queryInterface.removeColumn(TABLE, STATUS_COLUMN);
  await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${STATUS_ENUM}";`);
}
