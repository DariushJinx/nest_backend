import { Allow } from 'class-validator';

export class UpdateEpisodeDto_2 {
  readonly title: string;
  readonly text: string;
  readonly type: string;
  readonly chapter_id: number;
  filename: string;
  @Allow()
  fileUploadPath: string;
}
