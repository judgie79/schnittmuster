import { AdminActionLog } from "@infrastructure/database/models/AdminActionLog";
import { AdminNotification } from "@infrastructure/database/models/AdminNotification";
import { AdminNotificationDTO, AdminActionLogDTO } from "@schnittmuster/dtos";
import { NotFoundError } from "@shared/errors";

const toActionDTO = (log: AdminActionLog): AdminActionLogDTO => ({
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
});

const toNotificationDTO = (notification: AdminNotification): AdminNotificationDTO => ({
  id: notification.id,
  type: notification.type,
  title: notification.title ?? "",
  message: notification.message ?? "",
  related_metric: notification.relatedMetric ?? undefined,
  read: notification.read,
  created_at: notification.createdAt ?? new Date(),
});

export class AdminAuditService {
  async listActionLogs(limit = 50): Promise<AdminActionLogDTO[]> {
    const logs = await AdminActionLog.findAll({ order: [["createdAt", "DESC"]], limit });
    return logs.map(toActionDTO);
  }

  async listNotifications(adminId: string, limit = 20): Promise<AdminNotificationDTO[]> {
    const notifications = await AdminNotification.findAll({
      where: { adminId },
      order: [["createdAt", "DESC"]],
      limit,
    });
    return notifications.map(toNotificationDTO);
  }

  async markNotificationRead(notificationId: string, adminId: string): Promise<AdminNotificationDTO> {
    const notification = await AdminNotification.findOne({ where: { id: notificationId, adminId } });
    if (!notification) {
      throw new NotFoundError("Notification");
    }
    await notification.update({ read: true });
    return toNotificationDTO(notification);
  }
}
