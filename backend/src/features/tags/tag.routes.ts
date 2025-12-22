import { Router } from "express";
import { body } from "express-validator";
import { tagController } from "./TagController";
import { tagProposalController } from "./TagProposalController";
import { authenticate, AuthenticatedRequest } from "@middleware/auth";
import { validateRequest } from "@shared/validators/inputValidator";
import { authorize } from "@middleware/authorization";

const router: Router = Router();
const resolveTagOwner = async (req: AuthenticatedRequest): Promise<string | undefined> => req.user?.id;

router.use(authenticate);

router.get("/admin/categories", authorize({ roles: ["admin"] }), tagController.listAllCategories);
router.get("/admin/tags", authorize({ roles: ["admin"] }), tagController.listAllTags);

router.get("/categories", tagController.listCategories);
router.post(
  "/categories",
  authorize({ roles: ["admin"] }),
  [body("name").isString().isLength({ min: 3 }), body("displayOrder").optional().isInt()],
  validateRequest,
  tagController.createCategory
);
router.put(
  "/categories/:id",
  authorize({ roles: ["admin"] }),
  [body("name").optional().isString().isLength({ min: 3 }), body("displayOrder").optional().isInt()],
  validateRequest,
  tagController.updateCategory
);
router.delete("/categories/:id", authorize({ roles: ["admin"] }), tagController.removeCategory);
router.get("/", tagController.list);
router.post(
  "/",
  authorize({ roles: ["admin"] }),
  [
    body("name").isString().isLength({ min: 2 }),
    body("tagCategoryId").isUUID(),
    body("colorHex").matches(/^#[0-9A-Fa-f]{6}$/),
  ],
  validateRequest,
  tagController.create
);
router.put(
  "/:id",
  authorize({
    roles: ["admin"],
    rights: ["write"],
    resourceIdParam: "id",
    resourceType: "tag",
    resourceOwnerResolver: resolveTagOwner,
  }),
  [
    body("name").optional().isString(),
    body("tagCategoryId").optional().isUUID(),
    body("colorHex").optional().matches(/^#[0-9A-Fa-f]{6}$/),
  ],
  validateRequest,
  tagController.update
);
router.delete(
  "/:id",
  authorize({
    roles: ["admin"],
    rights: ["delete"],
    resourceIdParam: "id",
    resourceType: "tag",
    resourceOwnerResolver: resolveTagOwner,
  }),
  tagController.remove
);

router.get("/proposals", authorize({ roles: ["admin"] }), tagProposalController.listPending);
router.post(
  "/proposals/:proposalId/approve",
  authorize({ roles: ["admin"] }),
  tagProposalController.approve
);
router.post(
  "/proposals/:proposalId/reject",
  authorize({ roles: ["admin"] }),
  tagProposalController.reject
);

export const tagRouter: Router = router;
export default router;
