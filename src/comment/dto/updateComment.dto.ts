import { Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';
export class UpdateCommentDto {
  readonly comment: string;
  @IsOptional()
  @Expose()
  readonly score: number;
}
