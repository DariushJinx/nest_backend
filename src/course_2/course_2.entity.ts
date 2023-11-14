import { CategoryEntity } from '../category/category.entity';
import { UserEntity } from '../user/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OffEntity } from '../off/off.entity';

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

  @ManyToOne(() => CategoryEntity, (category) => category.courses, {
    eager: true,
  })
  category: CategoryEntity;

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
