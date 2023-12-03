import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OffEntity } from '../off/off.entity';
import { ChapterEntity_2 } from '../chapter_2/chapter_2.entity';
import { CommentEntity } from '../comment/comment.entity';
import { CourseCategoryEntity } from '../courseCategory/courseCategory.entity';
import { AdminEntity } from '../admin/admin.entity';

export enum typeEnum {
  FREE = 'free',
  CASH = 'cash',
  SPECIAL = 'special',
}

export enum statusEnum {
  NOT_STARTED = 'not_started',
  COMPLETED = 'completed',
  HOLDING = 'holding',
}

@Entity({ name: 'course_2' })
export class CourseEntity_2 {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  slug: string;

  @Column()
  title: string;

  @Column()
  short_title: string;

  @Column()
  text: string;

  @Column()
  short_text: string;

  @Column('simple-array')
  images: string[];

  @Column('simple-array')
  tags: string[];

  @Column('simple-array')
  tree_course: string[];

  @Column('simple-array')
  tree_course_name: string[];

  @Column({ default: 0 })
  price: number;

  @Column({ default: 0 })
  discount: number;

  @Column({ default: typeEnum.FREE, type: 'enum', enum: typeEnum })
  type: typeEnum;

  @Column({ default: 5 })
  courseAverageScore: number;

  @Column({ default: statusEnum.NOT_STARTED, type: 'enum', enum: statusEnum })
  status: statusEnum;

  @ManyToOne(() => CourseCategoryEntity, (category) => category.courses, {
    eager: true,
  })
  category: CourseCategoryEntity;

  @OneToMany(() => ChapterEntity_2, (chapter) => chapter.course_id)
  chapters: ChapterEntity_2[];

  @ManyToOne(() => AdminEntity, (user) => user.courses, { eager: true })
  teacher: AdminEntity;

  @OneToMany(() => OffEntity, (off) => off.id)
  offs: OffEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.course_id)
  comments: CommentEntity[];

  @Column({ default: 0 })
  favoritesCount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
