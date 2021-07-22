import {
  ArgumentMetadata,
  Injectable,
  Optional,
  PipeTransform,
  ValidationPipeOptions,
} from '@nestjs/common';
import { ObjectIdValidationException } from '../validations/object-id-validation.exception';
import { Types } from 'mongoose';

@Injectable()
export class ObjectIdValidationPipe
  implements PipeTransform<any, Types.ObjectId>
{
  options: ValidationPipeOptions;

  constructor(@Optional() options?: ValidationPipeOptions) {
    this.options = options || {};
  }

  transform(value: any, metadata: ArgumentMetadata): Types.ObjectId {
    const validObjectId =
      Types.ObjectId.isValid(value) &&
      Types.ObjectId(value).toString() === value;

    if (!validObjectId) {
      throw new ObjectIdValidationException(
        metadata.data,
        value,
        'Object ID Validation Error',
      );
    }

    return Types.ObjectId.createFromHexString(value);
  }
}
