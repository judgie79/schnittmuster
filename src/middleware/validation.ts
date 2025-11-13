import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../utils/errors";

export const validationErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      details: err.details,
    });
  }
  next(err);
};
