import { Expose } from 'class-transformer';
import { IsDefined, IsPhoneNumber, Matches } from 'class-validator';

export class CreateContactDto {
  @IsDefined({ message: 'نام ارسالی صحیح نمی باشد' })
  @Expose()
  name: string;
  @IsDefined({ message: 'ایمیل ارسالی صحیح نمی باشد' })
  @Expose()
  email: string;
  @IsDefined({ message: 'متن کوتاه دوره یافت نشد' })
  @Expose()
  @IsPhoneNumber('IR')
  @Matches(/^[+]*[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, {
    message: 'شماره تماس ارسالی صحیح نمی باشد',
  })
  phone: string;
  @IsDefined({ message: 'متن ارسالی صحیح نمی باشد' })
  @Expose()
  body: string;
}
