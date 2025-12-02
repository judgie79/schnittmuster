import { DataTypes, QueryInterface } from "sequelize";

const ROLE_TABLE = "roles";
const USER_ROLE_TABLE = "user_roles";
const RESOURCE_TABLE = "resources";
const RESOURCE_ACCESS_TABLE = "resource_access";
const ROLE_ENUM = "enum_roles_name";
const RESOURCE_TYPE_ENUM = "enum_resources_type";
const ACCESS_RIGHT_ENUM = "enum_resource_access_rights";
const ROLE_VALUES = ["user", "editor", "admin"] as const;
const RESOURCE_TYPES = ["pattern", "tag", "file"] as const;
const ACCESS_RIGHTS = ["read", "write", "delete"] as const;

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable(ROLE_TABLE, {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.ENUM(...ROLE_VALUES),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(255),
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

  await queryInterface.createTable(USER_ROLE_TABLE, {
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: ROLE_TABLE,
        key: "id",
      },
      onDelete: "CASCADE",
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
  await queryInterface.addConstraint(USER_ROLE_TABLE, {
    fields: ["user_id", "role_id"],
    type: "primary key",
    name: "pk_user_roles",
  });

  await queryInterface.createTable(RESOURCE_TABLE, {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM(...RESOURCE_TYPES),
      allowNull: false,
    },
    owner_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    reference_id: {
      type: DataTypes.UUID,
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

  await queryInterface.createTable(RESOURCE_ACCESS_TABLE, {
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    resource_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: RESOURCE_TABLE,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    rights: {
      type: DataTypes.ARRAY(DataTypes.ENUM(...ACCESS_RIGHTS)),
      allowNull: false,
      defaultValue: ["read"],
    },
    granted_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "SET NULL",
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
  await queryInterface.addConstraint(RESOURCE_ACCESS_TABLE, {
    fields: ["user_id", "resource_id"],
    type: "primary key",
    name: "pk_resource_access",
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable(RESOURCE_ACCESS_TABLE);
  await queryInterface.dropTable(RESOURCE_TABLE);
  await queryInterface.dropTable(USER_ROLE_TABLE);
  await queryInterface.dropTable(ROLE_TABLE);
  await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${ACCESS_RIGHT_ENUM}";`);
  await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${RESOURCE_TYPE_ENUM}";`);
  await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${ROLE_ENUM}";`);
}
