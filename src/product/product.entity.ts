import { FeatureEntity } from '../features/feature.entity';
import { CategoryEntity } from '../category/category.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { OffEntity } from '../off/off.entity';

@Entity({ name: 'products' })
export class ProductEntity {
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

  @Column('bigint')
  price: number;

  @Column('bigint')
  discount: number;

  @Column('bigint')
  count: number;

  @Column('simple-array')
  colors: string[];

  @Column('simple-array')
  featureIds: string[];

  @ManyToMany(() => FeatureEntity)
  @JoinTable()
  features: FeatureEntity[];

  @ManyToOne(() => CategoryEntity, (category) => category.products, {
    eager: true,
  })
  category: CategoryEntity;

  @ManyToOne(() => UserEntity, (user) => user.products, { eager: true })
  supplier: UserEntity;

  @OneToMany(() => OffEntity, (off) => off.id)
  offs: OffEntity[];

  @Column({ default: 0 })
  favoritesCount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
