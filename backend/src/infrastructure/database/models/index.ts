import { User } from "./User";
import { TagCategory } from "./TagCategory";
import { Tag } from "./Tag";
import { Pattern } from "./Pattern";
import { PatternTag } from "./PatternTag";
import { PatternNote } from "./PatternNote";
import { FileStorage } from "./FileStorage";
import { Role } from "./Role";
import { UserRole } from "./UserRole";
import { Resource } from "./Resource";
import { ResourceAccess } from "./ResourceAccess";
import { AdminRole } from "./AdminRole";
import { SystemMetric } from "./SystemMetric";
import { SystemSetting } from "./SystemSetting";
import { AdminActionLog } from "./AdminActionLog";
import { AdminNotification } from "./AdminNotification";
import { FlaggedContent } from "./FlaggedContent";
import { MeasurementType } from "./MeasurementType";
import { PatternMeasurement } from "./PatternMeasurement";

export const models = {
  User,
  TagCategory,
  Tag,
  Pattern,
  PatternTag,
  PatternNote,
  FileStorage,
  Role,
  UserRole,
  Resource,
  ResourceAccess,
  AdminRole,
  SystemMetric,
  SystemSetting,
  AdminActionLog,
  AdminNotification,
  FlaggedContent,
  MeasurementType,
  PatternMeasurement,
};

export function applyAssociations(): void {
  TagCategory.hasMany(Tag, { foreignKey: "tagCategoryId", as: "tags" });
  Tag.belongsTo(TagCategory, { foreignKey: "tagCategoryId", as: "category" });

  TagCategory.belongsTo(User, { foreignKey: "userId", as: "user" });
  User.hasMany(TagCategory, { foreignKey: "userId", as: "tagCategories" });

  User.hasMany(Pattern, { foreignKey: "userId", as: "patterns" });
  Pattern.belongsTo(User, { foreignKey: "userId", as: "user" });

  Pattern.belongsToMany(Tag, {
    through: PatternTag,
    as: "tags",
    foreignKey: "patternId",
    otherKey: "tagId",
  });
  Tag.belongsToMany(Pattern, {
    through: PatternTag,
    as: "patterns",
    foreignKey: "tagId",
    otherKey: "patternId",
  });

  Pattern.hasMany(PatternNote, { foreignKey: "patternId", as: "notes" });
  PatternNote.belongsTo(Pattern, { foreignKey: "patternId", as: "pattern" });

  Pattern.belongsTo(FileStorage, { foreignKey: "fileStorageId", as: "fileStorage" });
  FileStorage.hasOne(Pattern, { foreignKey: "fileStorageId", as: "pattern" });

  MeasurementType.belongsTo(User, { foreignKey: "userId", as: "user" });
  User.hasMany(MeasurementType, { foreignKey: "userId", as: "measurementTypes" });

  Pattern.hasMany(PatternMeasurement, { foreignKey: "patternId", as: "measurements" });
  PatternMeasurement.belongsTo(Pattern, { foreignKey: "patternId", as: "pattern" });

  MeasurementType.hasMany(PatternMeasurement, { foreignKey: "measurementTypeId", as: "patternMeasurements" });
  PatternMeasurement.belongsTo(MeasurementType, { foreignKey: "measurementTypeId", as: "measurementType" });

  User.belongsToMany(Role, { through: UserRole, as: "roles", foreignKey: "userId", otherKey: "roleId" });
  Role.belongsToMany(User, { through: UserRole, as: "users", foreignKey: "roleId", otherKey: "userId" });

  User.hasMany(Resource, { foreignKey: "ownerId", as: "resources" });
  Resource.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

  Resource.belongsToMany(User, {
    through: ResourceAccess,
    as: "sharedWith",
    foreignKey: "resourceId",
    otherKey: "userId",
  });
  User.belongsToMany(Resource, {
    through: ResourceAccess,
    as: "accessibleResources",
    foreignKey: "userId",
    otherKey: "resourceId",
  });

  User.hasOne(AdminRole, { foreignKey: "userId", as: "adminRoleAssignment" });
  AdminRole.belongsTo(User, { foreignKey: "userId", as: "user" });

  AdminActionLog.belongsTo(User, { foreignKey: "adminId", as: "admin" });
  AdminNotification.belongsTo(User, { foreignKey: "adminId", as: "admin" });
  FlaggedContent.belongsTo(User, { foreignKey: "flaggedByUserId", as: "flaggedBy" });
  FlaggedContent.belongsTo(User, { foreignKey: "reviewedByAdminId", as: "reviewedBy" });
}

applyAssociations();
