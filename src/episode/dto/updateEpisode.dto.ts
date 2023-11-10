import { Allow, Matches } from 'class-validator';

export class UpdateEpisodeDto {
  title: string;
  text: string;
  @Matches(/(lock|unlock)/i, { message: 'نوع قسمت صحیح نمی باشد' })
  type: string;
  @Matches(/(\.mp4|\.mov|\.mkv|\.mpg)$/, {
    message: 'ویدیو ارسال شده صحیح نمیباشد',
  })
  filename: string;
  @Allow()
  fileUploadPath: string;
}
