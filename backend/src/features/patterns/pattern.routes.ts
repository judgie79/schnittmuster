import { Router } from "express";
import multer from "multer";
import { body } from "express-validator";
import { patternController } from "./PatternController";
import { authenticate, AuthenticatedRequest } from "@middleware/auth";
import { authorize } from "@middleware/authorization";
import { validateRequest } from "@shared/validators/inputValidator";
import { PatternRepository } from "@infrastructure/database/repositories/PatternRepository";

const upload = multer({ storage: multer.memoryStorage() });
const router: Router = Router();
const patternRepository = new PatternRepository();

const resolvePatternOwner = async (req: AuthenticatedRequest): Promise<string | undefined> => {
  const patternId = req.params?.id;
  if (!patternId) {
    return undefined;
  }
  const pattern = await patternRepository.findById(patternId);
  return pattern?.userId;
};

router.use(authenticate);

router.get("/", patternController.list);
router.get(
  "/:id",
  authorize({ rights: ["read"], resourceIdParam: "id", resourceType: "pattern", resourceOwnerResolver: resolvePatternOwner }),
  patternController.get
);

router.post(
  "/",
  upload.single("file"),
  [body("name").isLength({ min: 3 }), body("description").optional().isString()],
  validateRequest,
  patternController.create
);

router.put(
  "/:id",
  authorize({
    rights: ["write"],
    resourceIdParam: "id",
    resourceType: "pattern",
    resourceOwnerResolver: resolvePatternOwner,
  }),
  upload.single("file"),
  [body("name").optional().isLength({ min: 3 })],
  validateRequest,
  patternController.update
);

router.delete(
  "/:id",
  authorize({
    rights: ["delete"],
    resourceIdParam: "id",
    resourceType: "pattern",
    resourceOwnerResolver: resolvePatternOwner,
  }),
  patternController.remove
);

export const patternRouter: Router = router;
export default router;
