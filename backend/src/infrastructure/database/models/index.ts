import { User } from "./User";
import { TagCategory } from "./TagCategory";
import { Tag } from "./Tag";
import { Pattern } from "./Pattern";
import { PatternTag } from "./PatternTag";
import { PatternNote } from "./PatternNote";
import { PatternTagProposal } from "./PatternTagProposal";
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

export const models = {
  User,
  TagCategory,
  Tag,
  Pattern,
  PatternTag,
  PatternNote,
  PatternTagProposal,
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
};

export function applyAssociations(): void {
  TagCategory.hasMany(Tag, { foreignKey: "tagCategoryId", as: "tags" });
  Tag.belongsTo(TagCategory, { foreignKey: "tagCategoryId", as: "category" });

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

  Pattern.hasMany(PatternTagProposal, { foreignKey: "patternId", as: "tagProposals" });
  PatternTagProposal.belongsTo(Pattern, { foreignKey: "patternId", as: "pattern" });
  PatternTagProposal.belongsTo(TagCategory, { foreignKey: "tagCategoryId", as: "category" });
  PatternTagProposal.belongsTo(Tag, { foreignKey: "tagId", as: "tag" });
  PatternTagProposal.belongsTo(User, { foreignKey: "userId", as: "proposedBy" });
  PatternTagProposal.belongsTo(User, { foreignKey: "approvedByUserId", as: "approvedBy" });

  Pattern.belongsTo(FileStorage, { foreignKey: "fileStorageId", as: "fileStorage" });
  FileStorage.hasOne(Pattern, { foreignKey: "fileStorageId", as: "pattern" });

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
