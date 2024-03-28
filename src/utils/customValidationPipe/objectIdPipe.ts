import {
  PipeTransform,
  Injectable,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { Types } from 'mongoose';

export interface IParseObjectIdPipe {
  optional?: boolean;
}

/**
 * Pipe to transform a string to a MongoDB ObjectId.
 */
@Injectable()
export class ParseObjectIdPipe implements PipeTransform<any, Types.ObjectId> {
  constructor(@Optional() protected readonly option?: IParseObjectIdPipe) {
    option = option ?? {};
  }
  /**
   * Transforms the input value to a MongoDB ObjectId.
   * @param value - The value to be transformed.
   * @returns MongoDB ObjectId.
   * @throws BadRequestException if the value is not a valid ObjectId.
   */
  transform(value: any): Types.ObjectId {
    if (this.option.optional) return value;

    // Check if the input value is a valid ObjectId
    const validObjectId = Types.ObjectId.isValid(value);

    // If not a valid ObjectId, throw a BadRequestException
    if (!validObjectId) {
      throw new BadRequestException('Invalid ObjectId');
    }

    // Create a MongoDB ObjectId from the input value and return
    return Types.ObjectId.createFromHexString(value);
  }
}
