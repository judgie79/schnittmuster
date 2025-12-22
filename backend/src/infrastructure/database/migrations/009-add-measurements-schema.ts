import { DataTypes, QueryInterface } from "sequelize";
import { v4 as UUIDV4 } from "uuid";

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Create measurement_types table
  await queryInterface.createTable("measurement_types", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
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
    is_system_default: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    display_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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

  // Create pattern_measurements table
  await queryInterface.createTable("pattern_measurements", {
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
    measurement_type_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "measurement_types",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_required: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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

  // Add fabric requirement fields to patterns table
  await queryInterface.addColumn("patterns", "fabric_width", {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  });

  await queryInterface.addColumn("patterns", "fabric_length", {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  });

  await queryInterface.addColumn("patterns", "fabric_type", {
    type: DataTypes.STRING(255),
    allowNull: true,
  });

  // Add indexes
  await queryInterface.addIndex("measurement_types", {
    name: "measurement_types_user_id",
    fields: ["user_id"],
  });

  await queryInterface.addIndex("measurement_types", {
    name: "measurement_types_category",
    fields: ["category"],
  });

  await queryInterface.addIndex("pattern_measurements", {
    name: "pattern_measurements_pattern_id",
    fields: ["pattern_id"],
  });

  await queryInterface.addIndex("pattern_measurements", {
    name: "pattern_measurements_measurement_type_id",
    fields: ["measurement_type_id"],
  });

  // Add unique constraint to prevent duplicate measurements per pattern
  await queryInterface.addConstraint("pattern_measurements", {
    type: "unique",
    name: "pattern_measurements_pattern_measurement_unique",
    fields: ["pattern_id", "measurement_type_id"],
  });

  // Seed system default measurement types
  await queryInterface.bulkInsert("measurement_types", [
    {
      id: UUIDV4(),
      user_id: null,
      name: "Bust",
      description: "Measure around the fullest part of the bust",
      unit: "cm",
      category: "body",
      is_system_default: true,
      display_order: 1,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: UUIDV4(),
      user_id: null,
      name: "Waist",
      description: "Measure around the natural waistline",
      unit: "cm",
      category: "body",
      is_system_default: true,
      display_order: 2,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: UUIDV4(),
      user_id: null,
      name: "Hip",
      description: "Measure around the fullest part of the hips",
      unit: "cm",
      category: "body",
      is_system_default: true,
      display_order: 3,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: UUIDV4(),
      user_id: null,
      name: "Shoulder Width",
      description: "Measure from shoulder point to shoulder point across the back",
      unit: "cm",
      category: "body",
      is_system_default: true,
      display_order: 4,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: UUIDV4(),
      user_id: null,
      name: "Arm Length",
      description: "Measure from shoulder to wrist with arm slightly bent",
      unit: "cm",
      category: "body",
      is_system_default: true,
      display_order: 5,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: UUIDV4(),
      user_id: null,
      name: "Inseam",
      description: "Measure from crotch to ankle on the inside of the leg",
      unit: "cm",
      category: "body",
      is_system_default: true,
      display_order: 6,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: UUIDV4(),
      user_id: null,
      name: "Neck Circumference",
      description: "Measure around the base of the neck",
      unit: "cm",
      category: "body",
      is_system_default: true,
      display_order: 7,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: UUIDV4(),
      user_id: null,
      name: "Back Length",
      description: "Measure from base of neck to waist",
      unit: "cm",
      category: "body",
      is_system_default: true,
      display_order: 8,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Drop fabric requirement columns from patterns
  await queryInterface.removeColumn("patterns", "fabric_type");
  await queryInterface.removeColumn("patterns", "fabric_length");
  await queryInterface.removeColumn("patterns", "fabric_width");

  // Drop tables
  await queryInterface.dropTable("pattern_measurements");
  await queryInterface.dropTable("measurement_types");

  // Drop enums
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_measurement_types_unit";');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_measurement_types_category";');
}
