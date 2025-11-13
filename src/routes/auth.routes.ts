import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authMiddleware } from "../middleware/auth";
import { validate, userValidators } from "../utils/validators";

const router: Router = Router();

router.post("/register", validate(userValidators.register), AuthController.register);
router.post("/login", validate(userValidators.login), AuthController.login);
router.get("/profile", authMiddleware, AuthController.getProfile);

export default router;
