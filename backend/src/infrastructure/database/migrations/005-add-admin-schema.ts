import { DataTypes, QueryInterface } from "sequelize";
import bcrypt from "bcryptjs";

const ADMIN_ROLES_TABLE = "admin_roles";
const SYSTEM_METRICS_TABLE = "system_metrics";
const SYSTEM_SETTINGS_TABLE = "system_settings";
const ADMIN_ACTION_LOGS_TABLE = "admin_action_logs";
const ADMIN_NOTIFICATIONS_TABLE = "admin_notifications";
const FLAGGED_CONTENT_TABLE = "flagged_content";

const ADMIN_ROLE_VALUES = ["super_admin", "admin", "moderator"] as const;
const ADMIN_STATUS_VALUES = ["active", "suspended", "deleted"] as const;
const METRIC_TYPE_VALUES = ["server", "database", "api", "storage"] as const;
const SETTINGS_DATA_TYPE_VALUES = ["string", "number", "boolean", "json"] as const;
const ACTION_STATUS_VALUES = ["success", "failure"] as const;
const NOTIFICATION_TYPE_VALUES = ["alert", "warning", "info", "critical"] as const;
const FLAGGED_RESOURCE_TYPES = ["pattern", "user", "comment"] as const;
const FLAG_REASON_VALUES = ["spam", "inappropriate", "copyright", "other"] as const;
const FLAG_STATUS_VALUES = ["pending", "reviewed", "approved", "rejected"] as const;
const DEFAULT_ADMIN_EMAIL = "admin@schnittmuster.local";
const DEFAULT_ADMIN_USERNAME = "system-admin";
const DEFAULT_ADMIN_PASSWORD = "AdminChangeMe123!";
const DEFAULT_ADMIN_USER_ID = "11111111-1111-1111-1111-111111111111";
const DEFAULT_ADMIN_ROLE_ID = "22222222-2222-2222-2222-222222222222";

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable(ADMIN_ROLES_TABLE, {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
    role: {
      type: DataTypes.ENUM(...ADMIN_ROLE_VALUES),
      allowNull: false,
    },
    assigned_by_user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "users", key: "id" },
      onDelete: "SET NULL",
    },
    assigned_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });
  await queryInterface.addConstraint(ADMIN_ROLES_TABLE, {
    fields: ["user_id"],
    type: "unique",
    name: "uniq_admin_roles_user_id",
  });

  await queryInterface.addColumn("users", "admin_status", {
    type: DataTypes.ENUM(...ADMIN_STATUS_VALUES),
    allowNull: false,
    defaultValue: "active",
  });
  await queryInterface.addColumn("users", "last_login", {
    type: DataTypes.DATE,
    allowNull: true,
  });
  await queryInterface.addColumn("users", "login_count", {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  });
  await queryInterface.addColumn("users", "failed_login_attempts", {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  });
  await queryInterface.addColumn("users", "last_failed_login", {
    type: DataTypes.DATE,
    allowNull: true,
  });
  await queryInterface.addColumn("users", "is_2fa_enabled", {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });

  await queryInterface.createTable(SYSTEM_METRICS_TABLE, {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    metric_type: {
      type: DataTypes.ENUM(...METRIC_TYPE_VALUES),
      allowNull: false,
    },
    metric_data: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    collected_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  await queryInterface.createTable(SYSTEM_SETTINGS_TABLE, {
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
    data_type: {
      type: DataTypes.ENUM(...SETTINGS_DATA_TYPE_VALUES),
      allowNull: false,
      defaultValue: "string",
    },
    updated_by_admin_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "users", key: "id" },
      onDelete: "SET NULL",
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  await queryInterface.createTable(ADMIN_ACTION_LOGS_TABLE, {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    admin_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    target_user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    target_resource_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    changes: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...ACTION_STATUS_VALUES),
      allowNull: false,
      defaultValue: "success",
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  await queryInterface.createTable(ADMIN_NOTIFICATIONS_TABLE, {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    admin_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
    type: {
      type: DataTypes.ENUM(...NOTIFICATION_TYPE_VALUES),
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
    related_metric: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  await queryInterface.createTable(FLAGGED_CONTENT_TABLE, {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    resource_type: {
      type: DataTypes.ENUM(...FLAGGED_RESOURCE_TYPES),
      allowNull: false,
    },
    resource_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    flagged_by_user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "users", key: "id" },
      onDelete: "SET NULL",
    },
    reason: {
      type: DataTypes.ENUM(...FLAG_REASON_VALUES),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...FLAG_STATUS_VALUES),
      allowNull: false,
      defaultValue: "pending",
    },
    reviewed_by_admin_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "users", key: "id" },
      onDelete: "SET NULL",
    },
    review_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  await queryInterface.addIndex(SYSTEM_METRICS_TABLE, ["metric_type", "collected_at"], {
    name: "idx_system_metrics_type_collected",
  });
  await queryInterface.addIndex(ADMIN_ACTION_LOGS_TABLE, ["admin_id", "created_at"], {
    name: "idx_admin_action_logs_admin_created",
  });
  await queryInterface.addIndex(FLAGGED_CONTENT_TABLE, ["status", "created_at"], {
    name: "idx_flagged_content_status_created",
  });

  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
  await queryInterface.sequelize.query(
    `INSERT INTO users (id, username, email, password_hash, auth_provider, admin_status, created_at, updated_at)
     VALUES (:id, :username, :email, :passwordHash, 'local', 'active', NOW(), NOW())
     ON CONFLICT (email) DO NOTHING`,
    {
      replacements: {
        id: DEFAULT_ADMIN_USER_ID,
        username: DEFAULT_ADMIN_USERNAME,
        email: DEFAULT_ADMIN_EMAIL,
        passwordHash,
      },
    }
  );

  await queryInterface.sequelize.query(
    `INSERT INTO ${ADMIN_ROLES_TABLE} (id, user_id, role, assigned_by_user_id, assigned_at)
     VALUES (:roleId, :userId, 'super_admin', :userId, NOW())
     ON CONFLICT (user_id) DO NOTHING`,
    {
      replacements: {
        roleId: DEFAULT_ADMIN_ROLE_ID,
        userId: DEFAULT_ADMIN_USER_ID,
      },
    }
  );
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(
    `DELETE FROM ${ADMIN_ROLES_TABLE} WHERE user_id = :userId`,
    { replacements: { userId: DEFAULT_ADMIN_USER_ID } }
  );
  await queryInterface.sequelize.query(
    `DELETE FROM users WHERE id = :userId`,
    { replacements: { userId: DEFAULT_ADMIN_USER_ID } }
  );

  await queryInterface.removeIndex(FLAGGED_CONTENT_TABLE, "idx_flagged_content_status_created");
  await queryInterface.removeIndex(ADMIN_ACTION_LOGS_TABLE, "idx_admin_action_logs_admin_created");
  await queryInterface.removeIndex(SYSTEM_METRICS_TABLE, "idx_system_metrics_type_collected");

  await queryInterface.dropTable(FLAGGED_CONTENT_TABLE);
  await queryInterface.dropTable(ADMIN_NOTIFICATIONS_TABLE);
  await queryInterface.dropTable(ADMIN_ACTION_LOGS_TABLE);
  await queryInterface.dropTable(SYSTEM_SETTINGS_TABLE);
  await queryInterface.dropTable(SYSTEM_METRICS_TABLE);

  await queryInterface.removeColumn("users", "is_2fa_enabled");
  await queryInterface.removeColumn("users", "last_failed_login");
  await queryInterface.removeColumn("users", "failed_login_attempts");
  await queryInterface.removeColumn("users", "login_count");
  await queryInterface.removeColumn("users", "last_login");
  await queryInterface.removeColumn("users", "admin_status");

  await queryInterface.removeConstraint(ADMIN_ROLES_TABLE, "uniq_admin_roles_user_id");
  await queryInterface.dropTable(ADMIN_ROLES_TABLE);

  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_flagged_content_status";');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_flagged_content_reason";');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_flagged_content_resource_type";');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_admin_notifications_type";');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_admin_action_logs_status";');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_system_settings_data_type";');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_system_metrics_metric_type";');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_admin_status";');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_admin_roles_role";');
}
