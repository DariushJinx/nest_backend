import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductEntity } from './product.entity';
import { UserEntity } from '../user/user.entity';
import { FeatureEntity } from '../features/feature.entity';
import { CommentEntity } from '../comment/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      UserEntity,
      FeatureEntity,
      CommentEntity,
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
