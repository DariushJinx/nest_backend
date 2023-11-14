import { ChapterEntity_2 } from '../chapter_2/chapter_2.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'episode_2' })
export class EpisodeEntity_2 {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  text: string;

  @Column({ default: 'unlock' })
  type: string;

  @Column()
  time: string;

  @Column()
  videoAddress: string;

  @Column()
  user_id: number;

  @ManyToOne(() => ChapterEntity_2, (chapter) => chapter.episodes, {
    eager: true,
  })
  chapter_id: ChapterEntity_2;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
