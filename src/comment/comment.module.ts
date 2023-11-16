import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { CourseEntity_2 } from '../course_2/course_2.entity';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { ProductEntity } from '../product/product.entity';
import { BlogEntity } from '../blog/blog.entity';
import { CommentEntity } from './comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommentEntity,
      UserEntity,
      CourseEntity_2,
      ProductEntity,
      BlogEntity,
    ]),
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
