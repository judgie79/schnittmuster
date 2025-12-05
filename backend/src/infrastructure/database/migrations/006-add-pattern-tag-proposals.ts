import { DataTypes, QueryInterface } from "sequelize";

const TABLE_NAME = "pattern_tag_proposals";
const STATUS_ENUM = ["pending", "approved", "rejected"] as const;

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable(TABLE_NAME, {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    pattern_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "patterns",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    tag_category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "tag_categories",
        key: "id",
      },
      onDelete: "RESTRICT",
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    color_hex: {
      type: DataTypes.STRING(7),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...STATUS_ENUM),
      allowNull: false,
      defaultValue: "pending",
    },
    tag_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "tags",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    approved_by_user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  await queryInterface.addIndex(TABLE_NAME, {
    name: "pattern_tag_proposals_pattern_status",
    fields: ["pattern_id", "status"],
  });

  await queryInterface.addIndex(TABLE_NAME, {
    name: "pattern_tag_proposals_name_category",
    fields: ["name", "tag_category_id"],
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable(TABLE_NAME);
}
