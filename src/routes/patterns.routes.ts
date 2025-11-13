import { Router } from "express";
import { PatternController } from "../controllers/PatternController";
import { authMiddleware } from "../middleware/auth";
import { validate, patternValidators } from "../utils/validators";

const router: Router = Router();

// Protect all pattern routes
router.use(authMiddleware);

router.post("/", validate(patternValidators.create), PatternController.create);
router.get("/", PatternController.getAll);
router.get("/search", PatternController.search);
router.get("/:id", PatternController.getById);
router.put("/:id", PatternController.update);
router.delete("/:id", PatternController.delete);

// Tag management
router.post("/:id/tags", validate(patternValidators.addTags), PatternController.addTags);
router.delete("/:id/tags/:tagId", PatternController.removeTag);

export default router;
