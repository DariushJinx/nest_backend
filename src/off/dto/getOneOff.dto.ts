import { Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class GetOneOffDto {
  @IsOptional()
  @Expose()
  product_id: number;
  @IsOptional()
  @Expose()
  course_id: number;
}
