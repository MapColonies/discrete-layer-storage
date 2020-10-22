import HttpStatus from 'http-status-codes';
import { HttpError } from './httpError';

export class ConflictError extends HttpError {
  public constructor(message: string);
  public constructor(error: Error, messageOverride?: string);
  public constructor(error: string | Error, messageOverride?: string) {
    if (error instanceof Error) {
      super(error, HttpStatus.CONFLICT, messageOverride);
    } else {
      super(error, HttpStatus.CONFLICT);
    }
    // Issue: https://github.com/microsoft/TypeScript/issues/10166
    // Reference: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
