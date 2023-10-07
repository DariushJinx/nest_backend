import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  PipeTransform,
  ValidationError,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

// ساخت ولیدیشن کاستوم

export class BackendValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    const object = plainToClass(metadata.metatype, value);

    // در اینجا گفتیم که آبجکت و یا آیدی و یا هر چیزی دیگه باشه مقدار ولیو برای ما ریترن بشه
    if (typeof object !== 'object') {
      return value;
    }

    const errors = await validate(object);

    if (errors.length === 0) {
      return value;
    }

    throw new HttpException(
      { errors: this.formatError(errors) },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }

  private formatError(errors: ValidationError[]) {
    return errors.reduce((acc, err: ValidationError) => {
      acc[err.property] = Object.values(err.constraints);
      return acc;
    }, {});
  }
}
