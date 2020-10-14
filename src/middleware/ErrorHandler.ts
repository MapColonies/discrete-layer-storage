import { MCLogger } from '@map-colonies/mc-logger';
import { ApiHttpError, ApiHttpResponse } from '@map-colonies/mc-model-types';
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { injectable } from 'tsyringe';
import { StatusCodes } from 'http-status-codes';
import { InputValidationError } from 'openapi-validator-middleware';

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
        res.status(StatusCodes.BAD_REQUEST).json(resBody);
      } else {
        this.logger.error(
          `${req.method} request to ${req.originalUrl}  has failed with error: ${err.message}`
        );
        resBody.error={
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          message: 'Internal Server Error'
        }
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(resBody);
      }
    };
  }
}
