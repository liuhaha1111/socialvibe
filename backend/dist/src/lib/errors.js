import { ZodError } from "zod";
export class AppError extends Error {
    status;
    code;
    constructor(status, code, message) {
        super(message);
        this.status = status;
        this.code = code;
    }
}
function formatZodMessage(error) {
    const first = error.issues[0];
    if (!first) {
        return "Invalid request";
    }
    const path = first.path.length > 0 ? first.path.join(".") : "";
    if (path && first.message === "Required") {
        return `${path} is required`;
    }
    return first.message;
}
export function toErrorResponse(error) {
    if (error instanceof ZodError) {
        return {
            status: 400,
            body: {
                code: "BAD_REQUEST",
                message: formatZodMessage(error),
                data: null
            }
        };
    }
    if (error instanceof AppError) {
        return {
            status: error.status,
            body: {
                code: error.code,
                message: error.message,
                data: null
            }
        };
    }
    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (message.includes("jwt") || message.includes("token")) {
            return {
                status: 401,
                body: {
                    code: "UNAUTHORIZED",
                    message: "Invalid or expired token",
                    data: null
                }
            };
        }
    }
    return {
        status: 500,
        body: {
            code: "INTERNAL_ERROR",
            message: "Internal server error",
            data: null
        }
    };
}
