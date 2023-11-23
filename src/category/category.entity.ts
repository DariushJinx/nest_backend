import { CourseEntity } from '../course/course.entity';
import { BlogEntity } from '../blog/blog.entity';
import { ProductEntity } from '../product/product.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AdminEntity } from '../admin/admin.entity';

@Entity({ name: 'categories' })
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('simple-array')
  images: string[];

  @OneToMany(() => BlogEntity, (blog) => blog.category)
  blogs: BlogEntity[];

  @OneToMany(() => ProductEntity, (product) => product.category)
  products: ProductEntity[];

  @OneToMany(() => CourseEntity, (course) => course.category)
  courses: CourseEntity[];

  @ManyToOne(() => AdminEntity, (admin) => admin.categories, { eager: true })
  register: AdminEntity;
}
