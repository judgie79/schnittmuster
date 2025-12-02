import { AdminUserDTO, AdminUserUpdateDTO, AdminUserBulkActionDTO, AdminActionLogDTO } from "@shared/dtos";
import {
  AdminUserRepository,
  UserFilters,
} from "@infrastructure/database/repositories/AdminUserRepository";
import type { AdminRoleName } from "@infrastructure/database/models/AdminRole";
import type { User } from "@infrastructure/database/models/User";

export class AdminUserService {
  constructor(private readonly repo = new AdminUserRepository()) {}

  async listUsers(
    page = 1,
    pageSize = 20,
    filters?: UserFilters
  ): Promise<{ users: AdminUserDTO[]; total: number }> {
    const { rows, count } = await this.repo.findAllWithFilters(page, pageSize, filters);
    return { users: rows.map((user) => this.toAdminUserDTO(user)), total: count };
  }

  async getUser(userId: string): Promise<AdminUserDTO> {
    const user = await this.repo.findByIdWithDetails(userId);
    return this.toAdminUserDTO(user);
  }

  async updateUser(userId: string, updates: AdminUserUpdateDTO, adminId: string): Promise<AdminUserDTO> {
    const { admin_role, ...rest } = updates;
    const data: Partial<User> = {};
    const changeSet: Record<string, unknown> = {};
    if (rest.status) {
      (data as any).adminStatus = rest.status;
      changeSet.status = rest.status;
    }
    if (typeof rest.is_2fa_enabled === "boolean") {
      (data as any).is2faEnabled = rest.is_2fa_enabled;
      changeSet.is_2fa_enabled = rest.is_2fa_enabled;
    }
    if (admin_role) {
      changeSet.admin_role = admin_role;
    }

    const updated = await this.repo.updateUser(userId, data, admin_role);

    await this.repo.logAdminAction({
      adminId,
      action: "user_role_change",
      targetUserId: userId,
      changes: Object.keys(changeSet).length ? changeSet : undefined,
    });

    return this.toAdminUserDTO(updated);
  }

  async bulkAction(payload: AdminUserBulkActionDTO, adminId: string): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const userId of payload.user_ids) {
      try {
        if (payload.action === "change_role" && payload.role) {
          await this.updateUser(userId, { admin_role: payload.role }, adminId);
        } else if (payload.action === "suspend") {
          await this.suspendUser(userId, "Bulk suspension", adminId);
        } else if (payload.action === "activate") {
          await this.activateUser(userId, adminId);
        } else if (payload.action === "delete") {
          await this.deleteUser(userId, "Bulk delete", adminId);
        }
        success++;
      } catch (error) {
        failed++;
        await this.repo.logAdminAction({
          adminId,
          action: "user_role_change",
          targetUserId: userId,
          status: "failure",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return { success, failed };
  }

  async suspendUser(userId: string, reason: string, adminId: string): Promise<AdminUserDTO> {
    const updated = await this.repo.updateUser(userId, { adminStatus: "suspended" });
    await this.repo.logAdminAction({
      adminId,
      action: "user_suspend",
      targetUserId: userId,
      reason,
    });
    await this.repo.sendNotification(userId, "Account Suspended", reason);
    return this.toAdminUserDTO(updated);
  }

  async activateUser(userId: string, adminId: string): Promise<AdminUserDTO> {
    const updated = await this.repo.updateUser(userId, { adminStatus: "active" });
    await this.repo.logAdminAction({
      adminId,
      action: "user_activate",
      targetUserId: userId,
    });
    return this.toAdminUserDTO(updated);
  }

  async deleteUser(userId: string, reason: string, adminId: string): Promise<void> {
    await this.repo.updateUser(userId, { adminStatus: "deleted" });
    await this.repo.logAdminAction({
      adminId,
      action: "user_delete",
      targetUserId: userId,
      reason,
    });
  }

  async userActivity(userId: string, limit = 50): Promise<AdminActionLogDTO[]> {
    const logs = await this.repo.getUserActivityLogs(userId, limit);
    return logs.map((log) => ({
      id: log.id,
      admin_id: log.adminId,
      action: log.action,
      target_user_id: log.targetUserId ?? undefined,
      target_resource_id: log.targetResourceId ?? undefined,
      changes: (log.changes as Record<string, unknown>) ?? {},
      reason: log.reason ?? undefined,
      status: log.status,
      error_message: log.errorMessage ?? undefined,
      created_at: log.createdAt ?? new Date(),
    }));
  }

  private toAdminUserDTO(user: import("@infrastructure/database/models/User").User): AdminUserDTO {
    const patternsCount = Number((user as any).getDataValue("patternsCount")) || 0;
    const storageUsedMb = Number((user as any).getDataValue("storageUsedMb")) || 0;

    return {
      ...this.baseUser(user),
      admin_role: user.adminRoleAssignment?.role ?? "moderator",
      status: user.adminStatus,
      last_login: user.lastLogin ?? undefined,
      login_count: user.loginCount,
      failed_login_attempts: user.failedLoginAttempts,
      last_failed_login: user.lastFailedLogin ?? undefined,
      is_2fa_enabled: user.is2faEnabled,
      storage_used_mb: storageUsedMb,
      patterns_count: patternsCount,
      created_at: user.createdAt?.toISOString() ?? new Date().toISOString(),
      updated_at: user.updatedAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  private baseUser(user: import("@infrastructure/database/models/User").User) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      authProvider: user.authProvider,
      createdAt: user.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: user.updatedAt?.toISOString() ?? new Date().toISOString(),
    };
  }
}
