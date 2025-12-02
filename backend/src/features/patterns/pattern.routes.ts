import { Router } from "express";
import multer from "multer";
import { body } from "express-validator";
import { patternController } from "./PatternController";
import { authenticate } from "@middleware/auth";
import { validateRequest } from "@shared/validators/inputValidator";

const upload = multer({ storage: multer.memoryStorage() });
const router: Router = Router();

router.use(authenticate);

router.get("/", patternController.list);
router.get("/:id", patternController.get);

router.post(
  "/",
  upload.single("file"),
  [body("name").isLength({ min: 3 }), body("description").optional().isString()],
  validateRequest,
  patternController.create
);

router.put(
  "/:id",
  upload.single("file"),
  [body("name").optional().isLength({ min: 3 })],
  validateRequest,
  patternController.update
);

router.delete("/:id", patternController.remove);

export const patternRouter: Router = router;
export default router;
