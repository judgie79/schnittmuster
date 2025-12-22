import { Router } from "express";
import { body } from "express-validator";
import { tagController } from "./TagController";
import { authenticate, AuthenticatedRequest } from "@middleware/auth";
import { validateRequest } from "@shared/validators/inputValidator";
import { authorize } from "@middleware/authorization";

const router: Router = Router();
const resolveTagOwner = async (req: AuthenticatedRequest): Promise<string | undefined> => req.user?.id;

router.use(authenticate);

router.get("/admin/categories", authorize({ roles: ["admin"] }), tagController.listAllCategories);
router.get("/admin/tags", authorize({ roles: ["admin"] }), tagController.listAllTags);

router.get("/categories",
  authorize({ allowOwner: true }), tagController.listCategories);
router.post(
  "/categories",
  authorize({ allowOwner: true }),
  [body("name").isString().isLength({ min: 3 }), body("displayOrder").optional().isInt()],
  validateRequest,
  tagController.createCategory
);
router.put(
  "/categories/:id",
  authorize({ allowOwner: true }),
  [body("name").optional().isString().isLength({ min: 3 }), body("displayOrder").optional().isInt()],
  validateRequest,
  tagController.updateCategory
);
router.delete("/categories/:id", authorize({ allowOwner: true }), tagController.removeCategory);
router.get("/", authorize({ allowOwner: true }), tagController.list);
router.post(
  "/",
  authorize({ allowOwner: true }),
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
    resourceIdParam: "id",
    resourceType: "tag", allowOwner: true,
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
    rights: ["delete"],
    resourceIdParam: "id",
    resourceType: "tag", allowOwner: true,
    resourceOwnerResolver: resolveTagOwner,
  }),
  tagController.remove
);

export const tagRouter: Router = router;
export default router;
