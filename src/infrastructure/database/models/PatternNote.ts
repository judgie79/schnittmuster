import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@config/database";

export interface PatternNoteAttributes {
  id: string;
  patternId: string;
  noteText: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PatternNoteCreationAttributes = Optional<PatternNoteAttributes, "id">;

export class PatternNote
  extends Model<PatternNoteAttributes, PatternNoteCreationAttributes>
  implements PatternNoteAttributes
{
  public id!: string;
  public patternId!: string;
  public noteText!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PatternNote.init(
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
    noteText: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "note_text",
    },
  },
  {
    sequelize,
    tableName: "pattern_notes",
    timestamps: true,
    underscored: true,
  }
);
