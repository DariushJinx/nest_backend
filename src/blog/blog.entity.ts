import { CategoryEntity } from '../category/category.entity';
import { UserEntity } from '../user/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column('simple-array')
  images: string[];

  @Column('simple-array')
  tags: string[];

  @ManyToOne(() => CategoryEntity, (category) => category.id, { eager: true })
  category: CategoryEntity;

  @ManyToOne(() => UserEntity, (user) => user.blogs, { eager: true })
  author: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.likes, { eager: true })
  likes: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.dislikes, { eager: true })
  dislikes: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.bookmarks, { eager: true })
  bookmarks: UserEntity;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
