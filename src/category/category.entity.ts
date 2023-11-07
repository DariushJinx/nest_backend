import { CourseEntity } from '../course/course.entity';
import { BlogEntity } from '../blog/blog.entity';
import { ProductEntity } from '../product/product.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

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
}
