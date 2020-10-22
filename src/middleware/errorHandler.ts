import { MCLogger } from '@map-colonies/mc-logger';
import { ApiHttpResponse } from '@map-colonies/mc-model-types';
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { injectable } from 'tsyringe';
import { StatusCodes } from 'http-status-codes';
import { InputValidationError } from 'openapi-validator-middleware';
import { HttpError } from '../exceptions/httpError';

@injectable()
export class ErrorHandler {
  public constructor(private readonly logger: MCLogger) {}

  public getErrorHandlerMiddleware(): ErrorRequestHandler {
    return (
      err: Error,
      req: Request,
      res: Response,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      next: NextFunction
    ): void => {
      const resBody: ApiHttpResponse = {
        success: false,
      };
      if (err instanceof InputValidationError) {
        resBody.error = {
          statusCode: StatusCodes.BAD_REQUEST,
          message: {
            validationErrors: err.errors,
          },
        };
      } else if (err instanceof HttpError) {
        resBody.error = {
          statusCode: err.status,
          message: err.message,
        };
      } else {
        this.logger.error(
          `${req.method} request to ${req.originalUrl}  has failed with error: ${err.message}`
        );
        resBody.error = {
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          message: 'Internal Server Error',
        };
      }
      res.status(resBody.error.statusCode).json(resBody);
    };
  }
}
