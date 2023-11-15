import { Expose } from 'class-transformer';
import { IsDefined, Length } from 'class-validator';

export class SetDiscountOnAllDto {
  @IsDefined({ message: 'کد ارسال شده صحیح نمی باشد' })
  @Expose()
  @Length(0, 100, { message: 'تخفیف ارسالی برای تمام محصولات صحیح نمی باشد' })
  discount: number;
}
