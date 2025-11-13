import { Router } from "express";
import { TagController } from "../controllers/TagController";
import { authMiddleware } from "../middleware/auth";

const router: Router = Router();

// Tag endpoints don't need auth (they're system-wide)
router.get("/categories", TagController.getAllCategories);
router.get("/categories/:categoryId", TagController.getCategoryWithTags);
router.get("/categories/:categoryId/tags", TagController.getTagsByCategory);
router.get("/:id", TagController.getTag);

// Protected routes for tag management
router.use(authMiddleware);
router.post("/categories/:categoryId/tags", TagController.createTag);
router.delete("/:id", TagController.deleteTag);

export default router;
