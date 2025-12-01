import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import { ValidationError } from "@shared/errors";

export const validateRequest: RequestHandler = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ValidationError("Validation failed", errors.array()));
  }
  return next();
};
