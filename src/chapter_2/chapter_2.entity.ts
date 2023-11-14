import { EpisodeEntity_2 } from '../episode_2/episode_2.entity';
import { CourseEntity_2 } from '../course_2/course_2.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'chapter_2' })
export class ChapterEntity_2 {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  text: string;

  @Column()
  user_id: number;

  @ManyToOne(() => CourseEntity_2, (course) => course.chapters, {
    eager: true,
  })
  course_id: CourseEntity_2;

  @OneToMany(() => EpisodeEntity_2, (episode) => episode.chapter_id)
  episodes: EpisodeEntity_2[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
