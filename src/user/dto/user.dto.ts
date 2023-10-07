import { Expose } from 'class-transformer';
import { IsDefined, Length } from 'class-validator';

export class LoginDto {
  @IsDefined()
  @Expose()
  @Length(3, 11, {
    message: 'تعداد کاراکترهای  یوزرنیم باید بین 3 تا 11  باشد',
  })
  username: string;
  @IsDefined()
  @Expose()
  password: string;
}
