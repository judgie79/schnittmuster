import { body, validationResult, ValidationChain } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "./errors";

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors: Record<string, string[]> = {};
    errors.array().forEach((err: any) => {
      if (!extractedErrors[err.param]) {
        extractedErrors[err.param] = [];
      }
      extractedErrors[err.param].push(err.msg);
    });

    throw new ValidationError("Validierungsfehler", extractedErrors);
  };
};

// Validators
export const userValidators = {
  register: [
    body("username")
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage("Benutzername muss zwischen 3 und 20 Zeichen lang sein"),
    body("email")
      .isEmail()
      .withMessage("Gültige E-Mail erforderlich"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Passwort muss mindestens 8 Zeichen lang sein"),
  ],

  login: [
    body("email").isEmail().withMessage("Gültige E-Mail erforderlich"),
    body("password").notEmpty().withMessage("Passwort erforderlich"),
  ],
};

export const patternValidators = {
  create: [
    body("name")
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage("Name erforderlich (max 255 Zeichen)"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Beschreibung zu lang (max 1000 Zeichen)"),
  ],

  addTags: [
    body("tag_ids")
      .isArray()
      .withMessage("tag_ids muss ein Array sein"),
  ],
};
