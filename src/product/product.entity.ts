import { FeatureEntity } from '../features/feature.entity';
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
import { CommentEntity } from '../comment/comment.entity';
import { ProductCategoryEntity } from '../productCategory/productCategory.entity';

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

  @Column({ default: 5 })
  productAverageScore: number;

  @Column('simple-array')
  featureIds: string[];

  @ManyToMany(() => FeatureEntity)
  @JoinTable()
  features: FeatureEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.product_id)
  comments: CommentEntity[];

  @ManyToOne(() => ProductCategoryEntity, (category) => category.products, {
    eager: true,
  })
  category: ProductCategoryEntity;

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
