import { Expose } from 'class-transformer';
import { IsDefined, Matches, Length, Allow, IsOptional } from 'class-validator';
import { MongoIDPattern } from 'src/config';
export class CreateCategoryDto {
  @IsDefined()
  @Expose()
  @Length(3, 30, { message: 'عنوان دسته بندی وارد شده صحیح نمی باشد' })
  title: string;
  @Expose()
  @Allow()
  @IsOptional()
  @Matches(MongoIDPattern, {
    message: 'شناسه وارد شده صحیح نمی باشد',
  })
  parent?: string;
  @Expose()
  @IsOptional()
  @Matches(/(\.png|\.jpg|\.webp|\.jpeg|\.gif)$/, {
    message: 'فرمت عکس ارسالی صحیح نمی باشد',
  })
  filename?: string;
  @Allow()
  fileUploadPath: string;
}
