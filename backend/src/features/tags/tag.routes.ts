import { Router } from "express";
import { body } from "express-validator";
import { tagController } from "./TagController";
import { authenticate, AuthenticatedRequest } from "@middleware/auth";
import { validateRequest } from "@shared/validators/inputValidator";
import { authorize } from "@middleware/authorization";

const router: Router = Router();
const resolveTagOwner = async (req: AuthenticatedRequest): Promise<string | undefined> => req.user?.id;

router.use(authenticate);

router.get("/categories", tagController.listCategories);
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

export const tagRouter: Router = router;
export default router;
