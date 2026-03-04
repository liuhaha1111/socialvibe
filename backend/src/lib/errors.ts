export class AppError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function toErrorResponse(error: unknown): { status: number; body: { code: string; message: string; data: null } } {
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

  return {
    status: 500,
    body: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
      data: null
    }
  };
}
