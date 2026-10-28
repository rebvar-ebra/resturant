/**
 * Domain errors. Presentation maps these to the stable error model of spec §16.1
 * (code, message, requestId, details) without leaking internals.
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;
  readonly details?: Record<string, unknown>;

  constructor(message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = new.target.name;
    if (details !== undefined) this.details = details;
  }
}

export class InvariantViolationError extends DomainError {
  readonly code = "INVARIANT_VIOLATION";
}

export class InvalidStateTransitionError extends DomainError {
  readonly code = "INVALID_STATE_TRANSITION";

  constructor(from: string, to: string, details?: Record<string, unknown>) {
    super(`Transition from "${from}" to "${to}" is not allowed`, {
      from,
      to,
      ...details,
    });
  }
}

export class ConcurrencyConflictError extends DomainError {
  readonly code = "CONCURRENCY_CONFLICT";

  constructor(expectedVersion: number, currentVersion: number) {
    super("Entity changed concurrently", { expectedVersion, currentVersion });
  }
}

export class NotFoundError extends DomainError {
  readonly code = "NOT_FOUND";

  constructor(resource: string, id: string) {
    super(`${resource} not found`, { resource, id });
  }
}

export class PermissionDeniedError extends DomainError {
  readonly code = "PERMISSION_DENIED";
}
