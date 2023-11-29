import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AdminEntity } from '../admin/admin.entity';
import { CourseEntity_2 } from '../course_2/course_2.entity';

@Entity({ name: 'courseCategory' })
export class CourseCategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('simple-array')
  images: string[];

  @OneToMany(() => CourseEntity_2, (course) => course.category)
  courses: CourseEntity_2[];

  @ManyToOne(() => AdminEntity, (admin) => admin.categories, { eager: true })
  register: AdminEntity;

  @Column({ default: 0 })
  parent: number;

  @Column({ default: 0 })
  isLast: number;

  @Column('simple-array')
  tree_cat: string[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
