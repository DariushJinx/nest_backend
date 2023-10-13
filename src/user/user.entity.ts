import { hash } from 'bcrypt';
import { BlogEntity } from '../blog/blog.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @OneToMany(() => BlogEntity, (blog) => blog.likes)
  likes: BlogEntity[];

  @OneToMany(() => BlogEntity, (blog) => blog.dislikes)
  dislikes: BlogEntity[];

  @OneToMany(() => BlogEntity, (blog) => blog.bookmarks)
  bookmarks: BlogEntity[];
}
