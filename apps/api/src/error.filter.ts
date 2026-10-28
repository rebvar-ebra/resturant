import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { DomainError } from "@restaurantos/shared-kernel";
import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { ZodError } from "zod";

/**
 * Stable error model (spec §16.1):
 * { error: { code, message, requestId, details? } }
 * Never leaks PII, other tenants' data, or internals.
 */
@Catch()
export class GlobalErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalErrorFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const requestId =
      (req.headers["x-request-id"] as string | undefined) ?? randomUUID();

    const { status, code, message, details } = this.normalize(exception);

    if (status >= 500) {
      this.logger.error(
        `${req.method} ${req.url} -> ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    res.status(status).json({
      error: {
        code,
        message,
        requestId,
        ...(details !== undefined ? { details } : {}),
      },
    });
  }

  private normalize(exception: unknown): {
    status: number;
    code: string;
    message: string;
    details?: Record<string, unknown>;
  } {
    if (exception instanceof ZodError) {
      return {
        status: HttpStatus.BAD_REQUEST,
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: {
          issues: exception.issues.map((i) => ({
            path: i.path.join("."),
            code: i.code,
          })),
        },
      };
    }

    if (exception instanceof DomainError) {
      const status =
        exception.code === "NOT_FOUND"
          ? HttpStatus.NOT_FOUND
          : exception.code === "PERMISSION_DENIED"
            ? HttpStatus.FORBIDDEN
            : exception.code === "CONCURRENCY_CONFLICT"
              ? HttpStatus.CONFLICT
              : HttpStatus.UNPROCESSABLE_ENTITY;
      return {
        status,
        code: exception.code,
        message: exception.message,
        ...(exception.details !== undefined
          ? { details: exception.details }
          : {}),
      };
    }

    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      const code =
        exception.getStatus() === HttpStatus.UNAUTHORIZED
          ? "UNAUTHENTICATED"
          : exception.getStatus() === HttpStatus.NOT_FOUND
            ? "NOT_FOUND"
            : "HTTP_ERROR";
      const message =
        typeof body === "object" && body !== null && "message" in body
          ? String((body as { message: unknown }).message)
          : exception.message;
      return { status: exception.getStatus(), code, message };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: "INTERNAL_ERROR",
      message: "Unexpected error",
    };
  }
}
