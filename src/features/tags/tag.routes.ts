import { Router } from "express";
import { body } from "express-validator";
import { tagController } from "./TagController";
import { authenticate } from "@middleware/auth";
import { validateRequest } from "@shared/validators/inputValidator";

const router: Router = Router();

router.use(authenticate);

router.get("/", tagController.list);
router.post(
  "/",
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
  [
    body("name").optional().isString(),
    body("tagCategoryId").optional().isUUID(),
    body("colorHex").optional().matches(/^#[0-9A-Fa-f]{6}$/),
  ],
  validateRequest,
  tagController.update
);
router.delete("/:id", tagController.remove);

export const tagRouter: Router = router;
export default router;
