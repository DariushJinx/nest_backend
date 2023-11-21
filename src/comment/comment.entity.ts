import { CourseEntity_2 } from '../course_2/course_2.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProductEntity } from '../product/product.entity';
import { BlogEntity } from '../blog/blog.entity';
import { UserEntity } from '../user/user.entity';

@Entity({ name: 'comment' })
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  show: number;

  @Column()
  comment: string;

  @Column({ enum: [1, 2, 3, 4, 5] })
  score: number;

  @Column({ default: 0 })
  parent: number;

  @Column({ default: 0 })
  isLast: number;

  @Column('simple-array')
  tree_comment: string[];

  @ManyToOne(() => CourseEntity_2, (course) => course.comments, {
    eager: true,
  })
  course_id: CourseEntity_2;

  @ManyToOne(() => ProductEntity, (product) => product.comments, {
    eager: true,
  })
  product_id: ProductEntity;

  @ManyToOne(() => BlogEntity, (course) => course.comments, {
    eager: true,
  })
  blog_id: BlogEntity;

  @ManyToOne(() => UserEntity, (user) => user.comments, {
    eager: true,
  })
  user_id: UserEntity;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
