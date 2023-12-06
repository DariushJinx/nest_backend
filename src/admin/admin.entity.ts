import { hash } from 'bcrypt';
import { BlogEntity } from '../blog/blog.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BlogCategoryEntity } from '../blogCategory/blogCategory.entity';
import { CourseEntity_2 } from '../course_2/course_2.entity';
import { ProductEntity } from '../product/product.entity';
import { OffEntity } from 'src/off/off.entity';

@Entity({ name: 'admin' })
export class AdminEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  username: string;

  @Column()
  mobile: string;

  @Column({ enum: ['0', '1'], default: '0' })
  isBan: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password, 10);
  }

  @OneToMany(() => BlogEntity, (blog) => blog.author)
  blogs: BlogEntity[];

  @OneToMany(() => BlogCategoryEntity, (blog) => blog.register)
  categories: BlogCategoryEntity[];

  @OneToMany(() => CourseEntity_2, (course) => course.teacher)
  courses: CourseEntity_2[];

  @OneToMany(() => ProductEntity, (product) => product.supplier)
  products: ProductEntity[];

  @OneToMany(() => OffEntity, (off) => off.creator)
  offs: OffEntity[];
}
