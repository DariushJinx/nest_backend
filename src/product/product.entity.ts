import { FeatureEntity } from '../features/feature.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OffEntity } from '../off/off.entity';
import { CommentEntity } from '../comment/comment.entity';
import { ProductCategoryEntity } from '../productCategory/productCategory.entity';
import { AdminEntity } from '../admin/admin.entity';

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
  tree_product: string[];

  @Column('simple-array')
  tree_product_name: string[];

  @Column({ default: 5 })
  productAverageScore: number;

  @OneToMany(() => FeatureEntity, (feature) => feature.product_id)
  features: FeatureEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.product_id)
  comments: CommentEntity[];

  @ManyToOne(() => ProductCategoryEntity, (category) => category.products, {
    eager: true,
  })
  category: ProductCategoryEntity;

  @ManyToOne(() => AdminEntity, (user) => user.products, { eager: true })
  supplier: AdminEntity;

  @OneToMany(() => OffEntity, (off) => off.id)
  offs: OffEntity[];

  @Column({ default: 0 })
  favoritesCount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
