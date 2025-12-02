import { Router } from "express";
import { body } from "express-validator";
import { authenticate } from "@middleware/auth";
import { requireAdmin } from "@middleware/adminOnly";
import { validateRequest } from "@shared/validators/inputValidator";
import { adminController } from "./AdminController";

const router: Router = Router();

router.use(authenticate, requireAdmin);

router.get("/users", adminController.listUsers);
router.get("/users/:id", adminController.getUser);
router.get("/users/:id/activity", adminController.userActivity);

router.patch(
  "/users/:id",
  [
    body("admin_role").optional().isIn(["super_admin", "admin", "moderator"]),
    body("status").optional().isIn(["active", "suspended", "deleted"]),
    body("is_2fa_enabled").optional().isBoolean(),
  ],
  validateRequest,
  adminController.updateUser
);

router.post(
  "/users/bulk-actions",
  [
    body("user_ids").isArray({ min: 1 }),
    body("action").isIn(["suspend", "activate", "delete", "change_role"]),
    body("role")
      .optional()
      .isIn(["super_admin", "admin", "moderator"]),
  ],
  validateRequest,
  adminController.bulkUserAction
);

router.post(
  "/users/:id/suspend",
  [body("reason").optional().isString()],
  validateRequest,
  adminController.suspendUser
);

router.post("/users/:id/activate", adminController.activateUser);

router.delete(
  "/users/:id",
  [body("reason").optional().isString()],
  validateRequest,
  adminController.deleteUser
);

router.get("/dashboard/metrics", adminController.systemMetrics);
router.get("/dashboard/analytics", adminController.analyticsReport);

router.get("/settings", adminController.getSettings);
router.put("/settings", adminController.updateSettings);

router.get("/notifications", adminController.listNotifications);
router.post("/notifications/:id/read", adminController.markNotificationRead);

router.get("/audit/logs", adminController.listAuditLogs);

export const adminRouter: Router = router;
export default router;
