import { UnprocessableEntityException } from '@nestjs/common';
import { Schema, Document } from 'mongoose';

// Interface representing an error object with code and keyValue properties
interface ErrorWithCode extends Error {
  code: number;
  keyValue: Record<string, any>;
}

/**
 * Middleware to handle MongoDB duplicate key errors and transform them into BadRequestExceptions with validation error messages.
 * @param schema - Mongoose schema to apply the middleware to.
 */
export default function handleError(schema: Schema<Document>): void {
  // Post save hook to handle duplicate key errors
  schema.post(
    'save',
    function (
      error: ErrorWithCode,
      doc: Document,
      next: (err?: Error) => void,
    ) {
      // If error is present and it's a duplicate key error
      if (error && error.code === 11000) {
        const errorKeys = Object.keys(error.keyValue);
        if (errorKeys.length !== 0) {
          // Construct validation error object with error messages
          const validationError = {};
          errorKeys.forEach((key) => {
            validationError[key] = [`${key} must be unique`];
          });
          const errorMessage = {
            message: 'Error Validation',
            error: validationError,
          };
          // Throw UnprocessableEntityException with validation error messages
          throw new UnprocessableEntityException(errorMessage);
        }
      }
      // Continue middleware chain
      next();
    },
  );
}
