import { Router, RequestHandler } from "express";
import multer from "multer";
import { body } from "express-validator";
import { patternController } from "./PatternController";
import { authenticate, AuthenticatedRequest } from "@middleware/auth";
import { authorize } from "@middleware/authorization";
import { validateRequest } from "@shared/validators/inputValidator";
import { PatternRepository } from "@infrastructure/database/repositories/PatternRepository";
import { tagProposalController } from "@features/tags/TagProposalController";

const upload = multer({ storage: multer.memoryStorage() });
const uploadFieldsHandler = upload.fields([
  { name: "file", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);
const uploadFieldsMiddleware: RequestHandler = (req, res, next) => uploadFieldsHandler(req, res, next);
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
  uploadFieldsMiddleware,
  [body("name").isLength({ min: 3 }), body("description").optional().isString()],
  validateRequest,
  patternController.create
);

router.post(
  "/:id/tag-proposals",
  [
    body("name").isString().isLength({ min: 2 }),
    body("tagCategoryId").isUUID(),
    body("colorHex").matches(/^#[0-9A-Fa-f]{6}$/),
  ],
  validateRequest,
  tagProposalController.createForPattern
);

router.get("/:id/tag-proposals", tagProposalController.listForPattern);

router.put(
  "/:id",
  authorize({
    rights: ["write"],
    resourceIdParam: "id",
    resourceType: "pattern",
    resourceOwnerResolver: resolvePatternOwner,
  }),
  uploadFieldsMiddleware,
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
