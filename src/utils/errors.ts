import {
	AppError,
	ValidationError,
	NotFoundError,
	ForbiddenError,
} from "@shared/errors";

export { AppError, ValidationError, NotFoundError, ForbiddenError };

export class UnauthorizedError extends AppError {
	constructor(message: string = "Authentifizierung erforderlich") {
		super(message, 401, { code: "UNAUTHORIZED" });
	}
}

export class ConflictError extends AppError {
	constructor(message: string) {
		super(message, 409, { code: "CONFLICT" });
	}
}
