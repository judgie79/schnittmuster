import { DataTypes, QueryInterface } from "sequelize";

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addColumn("tag_categories", "user_id", {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: "users",
      key: "id",
    },
    onDelete: "CASCADE",
  });

  await queryInterface.addIndex("tag_categories", ["user_id"]);

  await queryInterface.removeConstraint("tag_categories", "tag_categories_name_key");

  await queryInterface.addConstraint("tag_categories", {
    fields: ["name", "user_id"],
    type: "unique",
    name: "tag_categories_name_user_id_key",
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeConstraint("tag_categories", "tag_categories_name_user_id_key");

  await queryInterface.addConstraint("tag_categories", {
    fields: ["name"],
    type: "unique",
    name: "tag_categories_name_key",
  });

  await queryInterface.removeIndex("tag_categories", ["user_id"]);

  await queryInterface.removeColumn("tag_categories", "user_id");
}
