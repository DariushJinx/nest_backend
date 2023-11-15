import { Expose } from 'class-transformer';
import { Length, IsOptional } from 'class-validator';

export class UpdateOffDto {
  code: string;
  percent: number;
  @IsOptional()
  @Expose()
  product_id: number;
  @IsOptional()
  @Expose()
  course_id: number;
  @Length(1)
  @IsOptional()
  max: number;
}
