import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductEntity } from './product.entity';
import { UserEntity } from '../user/user.entity';
import { FeatureEntity } from '../features/feature.entity';
import { CommentEntity } from '../comment/comment.entity';
import { ProductCategoryEntity } from 'src/productCategory/productCategory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      UserEntity,
      FeatureEntity,
      CommentEntity,
      ProductCategoryEntity,
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
