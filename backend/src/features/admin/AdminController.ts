import { Request, Response } from "express";
import { asyncHandler } from "@middleware/errorHandler";
import { AuthenticatedRequest } from "@middleware/auth";
import { AdminUserService } from "./AdminUserService";
import { AdminMetricsService } from "./AdminMetricsService";
import { AdminSettingsService } from "./AdminSettingsService";
import { AdminAuditService } from "./AdminAuditService";
import type { AdminRoleName } from "@infrastructure/database/models/AdminRole";

const toNumber = (value: unknown, fallback: number): number => {
  const parsed = typeof value === "string" ? Number.parseInt(value, 10) : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const toAdminRole = (value: unknown): AdminRoleName | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }
  if (["super_admin", "admin", "moderator"].includes(value)) {
    return value as AdminRoleName;
  }
  return undefined;
};

export class AdminController {
  constructor(
    private readonly userService = new AdminUserService(),
    private readonly metricsService = new AdminMetricsService(),
    private readonly settingsService = new AdminSettingsService(),
    private readonly auditService = new AdminAuditService()
  ) {}

  listUsers = asyncHandler(async (req: Request, res: Response) => {
    const request = req as AuthenticatedRequest;
    const page = toNumber(request.query.page, 1);
    const pageSize = toNumber(request.query.pageSize, 20);
    const filters = {
      status: typeof request.query.status === "string" ? request.query.status : undefined,
      role: toAdminRole(request.query.role),
      search: typeof request.query.search === "string" ? request.query.search : undefined,
    };

    const { users, total } = await this.userService.listUsers(page, pageSize, filters);
    res.json({
      success: true,
      data: users,
      pagination: { page, pageSize, total },
    });
  });

  getUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.getUser(req.params.id);
    res.json({ success: true, data: user });
  });

  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const request = req as AuthenticatedRequest;
    const user = await this.userService.updateUser(req.params.id, req.body, request.user!.id);
    res.json({ success: true, data: user });
  });

  bulkUserAction = asyncHandler(async (req: Request, res: Response) => {
    const request = req as AuthenticatedRequest;
    const result = await this.userService.bulkAction(req.body, request.user!.id);
    res.json({ success: true, data: result });
  });

  suspendUser = asyncHandler(async (req: Request, res: Response) => {
    const request = req as AuthenticatedRequest;
    const user = await this.userService.suspendUser(req.params.id, req.body.reason ?? "Policy violation", request.user!.id);
    res.json({ success: true, data: user });
  });

  activateUser = asyncHandler(async (req: Request, res: Response) => {
    const request = req as AuthenticatedRequest;
    const user = await this.userService.activateUser(req.params.id, request.user!.id);
    res.json({ success: true, data: user });
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const request = req as AuthenticatedRequest;
    await this.userService.deleteUser(req.params.id, req.body?.reason ?? "Removed by admin", request.user!.id);
    res.status(204).send();
  });

  userActivity = asyncHandler(async (req: Request, res: Response) => {
    const limit = toNumber(req.query.limit, 50);
    const logs = await this.userService.userActivity(req.params.id, limit);
    res.json({ success: true, data: logs });
  });

  systemMetrics = asyncHandler(async (_req: Request, res: Response) => {
    const metrics = await this.metricsService.getSystemMetrics();
    res.json({ success: true, data: metrics });
  });

  analyticsReport = asyncHandler(async (req: Request, res: Response) => {
    const period = typeof req.query.period === "string" ? req.query.period : "daily";
    const report = await this.metricsService.getAnalyticsReport(
      period === "weekly" ? "weekly" : period === "monthly" ? "monthly" : "daily"
    );
    res.json({ success: true, data: report });
  });

  getSettings = asyncHandler(async (_req: Request, res: Response) => {
    const settings = await this.settingsService.getSettings();
    res.json({ success: true, data: settings });
  });

  updateSettings = asyncHandler(async (req: Request, res: Response) => {
    const request = req as AuthenticatedRequest;
    const settings = await this.settingsService.updateSettings(req.body, request.user!.id);
    res.json({ success: true, data: settings });
  });

  listNotifications = asyncHandler(async (req: Request, res: Response) => {
    const request = req as AuthenticatedRequest;
    const limit = toNumber(req.query.limit, 20);
    const notifications = await this.auditService.listNotifications(request.user!.id, limit);
    res.json({ success: true, data: notifications });
  });

  markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
    const request = req as AuthenticatedRequest;
    const notification = await this.auditService.markNotificationRead(req.params.id, request.user!.id);
    res.json({ success: true, data: notification });
  });

  listAuditLogs = asyncHandler(async (req: Request, res: Response) => {
    const limit = toNumber(req.query.limit, 50);
    const logs = await this.auditService.listActionLogs(limit);
    res.json({ success: true, data: logs });
  });
}

export const adminController = new AdminController();
