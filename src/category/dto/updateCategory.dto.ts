import { Allow } from 'class-validator';
export class UpdateCategoryDto {
  title: string;
  filename: string;
  @Allow()
  fileUploadPath: string;
}
