import { hash } from 'bcrypt';
import { BlogEntity } from '../blog/blog.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductEntity } from '../product/product.entity';
import { CourseEntity } from '../course/course.entity';
import { OffEntity } from '../off/off.entity';

@Entity({ name: 'users' })
export class UserEntity {
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

  @Column()
  email: string;

  @Column()
  password: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password, 10);
  }

  @Column({ default: 'USER' })
  role: string;

  @OneToMany(() => BlogEntity, (blog) => blog.author)
  blogs: BlogEntity[];

  @OneToMany(() => ProductEntity, (product) => product.supplier)
  products: ProductEntity[];

  @OneToMany(() => CourseEntity, (course) => course.teacher)
  courses: CourseEntity[];

  @OneToMany(() => OffEntity, (off) => off.creator)
  offs: OffEntity[];

  // این منی تو منی میاد یه ریلشن بین یوزرز و بلاگ میسازه که در این صورت یه تیبل جداگونه به این دوتا اختصاص داده میشه که دقیقا هم اسم این دو مورد استفاده شده می باشد و هر جای دیگه ای هم استفاده بشه دقیقا هم اسمشون رو میسازه
  @ManyToMany(() => BlogEntity)
  @JoinTable()
  favorites: BlogEntity[];

  @ManyToMany(() => ProductEntity)
  @JoinTable()
  favoritesProducts: ProductEntity[];

  @ManyToMany(() => CourseEntity)
  @JoinTable()
  favoriteCourses: CourseEntity[];
}
