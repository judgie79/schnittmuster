import rateLimit from "express-rate-limit";
import { environment } from "@config/environment";

export const apiLimiter = rateLimit({
  windowMs: environment.security.rateLimitWindow,
  max: environment.security.rateLimitMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
});
