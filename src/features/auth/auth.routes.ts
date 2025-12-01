import { Router } from "express";
import passport from "passport";
import { body } from "express-validator";
import { authController } from "./AuthController";
import { validateRequest } from "@shared/validators/inputValidator";
import { apiLimiter } from "@middleware/rateLimit";
import "./strategies/LocalStrategy";
import "./strategies/GoogleStrategy";

const router: Router = Router();

router.post(
  "/register",
  apiLimiter,
  [
    body("username").isLength({ min: 3, max: 50 }),
    body("email").isEmail(),
    body("password").isLength({ min: 8 }),
  ],
  validateRequest,
  authController.register
);

router.post(
  "/login",
  apiLimiter,
  [body("email").isEmail(), body("password").notEmpty()],
  validateRequest,
  authController.login
);

router.post(
  "/refresh",
  [body("refreshToken").notEmpty()],
  validateRequest,
  authController.refresh
);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  authController.handleGoogleCallback
);

export const authRouter: Router = router;
export default router;
