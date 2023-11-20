import { Expose } from 'class-transformer';
import { IsDefined } from 'class-validator';

export class CreateAnswerDto {
  @IsDefined({ message: 'پاسخ ارسالی صحیح نمی باشد' })
  @Expose()
  answer: string;
  @IsDefined({ message: 'ایمیل ارسالی صحیح نمی باشد' })
  @Expose()
  email: string;
}
