import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

/**
 * Custom validation pipe to handle validation errors and transform them into BadRequestExceptions with structured error messages.
 */
export class ValidationErrorHandler extends ValidationPipe {
  /**
   * Constructor to create a new instance of ValidationErrorHandler.
   * Configures the validation pipe with custom exception handling.
   */
  constructor() {
    super({
      skipMissingProperties: false,
      whitelist: true,
      exceptionFactory: (error: ValidationError[]) => {
        // Construct error response object
        let errorResponse = {
          message: 'Error Validation',
          error: {},
        };
        // Populate error object with validation error messages
        error.forEach((err) => {
          errorResponse.error[err.property] = Object.values(err.constraints);
        });
        // Throw BadRequestException with structured error response
        return new UnprocessableEntityException(errorResponse);
      },
    });
  }
}
