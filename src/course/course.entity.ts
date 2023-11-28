import { ChapterEntity } from '../chapter/chapter.entity';
import { UserEntity } from '../user/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OffEntity } from '../off/off.entity';
import { CourseCategoryEntity } from '../courseCategory/courseCategory.entity';

@Entity({ name: 'course' })
export class CourseEntity {
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

  @Column({ default: 'free', enum: ['free', 'cash', 'special'] })
  type: string;

  @Column({
    default: 'not_started',
    enum: ['not_started', 'completed', 'holding'],
  })
  status: string;

  @ManyToMany(() => ChapterEntity)
  @JoinTable()
  chapters: ChapterEntity[];

  @ManyToOne(() => CourseCategoryEntity, (category) => category.allCourses, {
    eager: true,
  })
  category: CourseCategoryEntity;

  @ManyToOne(() => UserEntity, (user) => user.courses, { eager: true })
  teacher: UserEntity;

  @OneToMany(() => OffEntity, (off) => off.id)
  offs: OffEntity[];

  @Column({ default: 0 })
  favoritesCount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
