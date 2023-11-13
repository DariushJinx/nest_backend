import { Expose } from 'class-transformer';
import { IsDefined, Length, IsOptional } from 'class-validator';

export class CreateOffDto {
  @IsDefined({ message: 'کد ارسال شده صحیح نمی باشد' })
  @Expose()
  code: string;
  @IsDefined({ message: 'عنوان کوتاه ارسالی محصول یافت نشد' })
  @Expose()
  @Length(0, 100, { message: 'درصد تخفیف ارسالی صحیح نمی باشد' })
  percent: string;
  @IsOptional()
  @Expose()
  product_id: number;
  @IsOptional()
  @Expose()
  course_id: number;
  @IsDefined({ message: ' تعداد کاربران ارسالی جهت تخفیف صحیح نمی باشد' })
  @Expose()
  @Length(1)
  @IsOptional()
  max: number;
}
