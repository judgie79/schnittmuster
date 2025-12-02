import { FindAndCountOptions, Op, WhereOptions, literal } from "sequelize";
import { User } from "@infrastructure/database/models/User";
import { AdminRole, AdminRoleName } from "@infrastructure/database/models/AdminRole";
import { AdminActionLog, AdminActionType } from "@infrastructure/database/models/AdminActionLog";
import { AdminNotification } from "@infrastructure/database/models/AdminNotification";
import { Pattern } from "@infrastructure/database/models/Pattern";
import { FileStorage } from "@infrastructure/database/models/FileStorage";
import { NotFoundError } from "@shared/errors";

const PATTERN_COUNT_SQL = `COALESCE((SELECT COUNT(*) FROM patterns p WHERE p.user_id = "User"."id"), 0)`;
const STORAGE_SUM_SQL = `COALESCE((
  SELECT SUM(fs.size) / 1024.0 / 1024.0
  FROM patterns p
  LEFT JOIN file_storage fs ON fs.id = p.file_storage_id
  WHERE p.user_id = "User"."id"
), 0)`;

export interface UserFilters {
  status?: string;
  role?: AdminRoleName;
  search?: string;
}

export class AdminUserRepository {
  async findAllWithFilters(
    page: number,
    pageSize: number,
    filters?: UserFilters
  ): Promise<{ rows: User[]; count: number }> {
    const where: WhereOptions = {};
    if (filters?.status) {
      where.adminStatus = filters.status;
    }

    if (filters?.search) {
      Object.assign(where, {
        [Op.or]: [
          { username: { [Op.iLike]: `%${filters.search}%` } },
          { email: { [Op.iLike]: `%${filters.search}%` } },
        ],
      });
    }

    const options: FindAndCountOptions<User> = {
      where,
      include: [
        {
          model: AdminRole,
          as: "adminRoleAssignment",
          required: !!filters?.role,
          where: filters?.role ? { role: filters.role } : undefined,
        },
      ],
      attributes: {
        include: [
          [literal(PATTERN_COUNT_SQL), "patternsCount"],
          [literal(STORAGE_SUM_SQL), "storageUsedMb"],
        ],
      },
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [["createdAt", "DESC"]],
    };

    return User.findAndCountAll(options);
  }

  async findByIdWithDetails(userId: string): Promise<User> {
    const user = await User.findByPk(userId, {
      include: [{ model: AdminRole, as: "adminRoleAssignment" }],
      attributes: {
        include: [
          [literal(PATTERN_COUNT_SQL), "patternsCount"],
          [literal(STORAGE_SUM_SQL), "storageUsedMb"],
        ],
      },
    });

    if (!user) {
      throw new NotFoundError("User");
    }
    return user;
  }

  async updateUser(userId: string, data: Partial<User>, adminRole?: AdminRoleName): Promise<User> {
    const user = await this.findByIdWithDetails(userId);
    await user.update(data);

    if (adminRole) {
      await AdminRole.upsert({ userId: user.id, role: adminRole });
    }

    return this.findByIdWithDetails(userId);
  }

  async getAdminRole(userId: string): Promise<AdminRoleName | null> {
    const record = await AdminRole.findOne({ where: { userId } });
    return record?.role ?? null;
  }

  async logAdminAction(params: {
    adminId: string;
    action: AdminActionType;
    targetUserId?: string;
    targetResourceId?: string;
    changes?: Record<string, unknown>;
    reason?: string;
    status?: "success" | "failure";
    errorMessage?: string;
  }): Promise<void> {
    await AdminActionLog.create({
      adminId: params.adminId,
      action: params.action,
      targetUserId: params.targetUserId,
      targetResourceId: params.targetResourceId,
      changes: params.changes ?? null,
      reason: params.reason ?? null,
      status: params.status ?? "success",
      errorMessage: params.errorMessage ?? null,
    });
  }

  async sendNotification(userId: string, title: string, message: string): Promise<void> {
    // Notify the affected user via internal admin notification stream for now
    await AdminNotification.create({
      adminId: userId,
      type: "info",
      title,
      message,
    });
  }

  async getUserActivityLogs(userId: string, limit: number): Promise<AdminActionLog[]> {
    return AdminActionLog.findAll({
      where: {
        [Op.or]: [{ targetUserId: userId }, { adminId: userId }],
      },
      limit,
      order: [["createdAt", "DESC"]],
    });
  }

  async getStorageSnapshot(): Promise<{ totalPatterns: number; totalStorageMb: number }> {
    const totalPatterns = await Pattern.count();
    const sizeSum = await FileStorage.sum("size");
    const totalStorageMb = sizeSum ? Number(sizeSum) / 1024 / 1024 : 0;
    return { totalPatterns, totalStorageMb };
  }
}
