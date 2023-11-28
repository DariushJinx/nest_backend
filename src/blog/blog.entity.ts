import { CommentEntity } from '../comment/comment.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AdminEntity } from '../admin/admin.entity';
import { BlogCategoryEntity } from '../blogCategory/blogCategory.entity';

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

  @Column('simple-array')
  tree_blog: string[];

  @Column('simple-array')
  tree_blog_name: string[];

  @ManyToOne(() => BlogCategoryEntity, (category) => category.blogs, {
    eager: true,
  })
  category: BlogCategoryEntity;

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
