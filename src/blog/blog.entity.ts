import { CommentEntity } from '../comment/comment.entity';
import { CategoryEntity } from '../category/category.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AdminEntity } from '../admin/admin.entity';

@Entity({ name: 'blog' })
export class BlogEntity {
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

  @Column({ default: 5 })
  blogAverageScore: number;

  @Column('simple-array')
  images: string[];

  @Column('simple-array')
  tags: string[];

  @ManyToOne(() => CategoryEntity, (category) => category.blogs, {
    eager: true,
  })
  category: CategoryEntity;

  @ManyToOne(() => AdminEntity, (admin) => admin.blogs, { eager: true })
  author: AdminEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.blog_id)
  comments: CommentEntity[];

  @Column({ default: 0 })
  favoritesCount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
