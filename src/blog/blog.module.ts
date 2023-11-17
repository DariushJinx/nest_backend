import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntity } from './blog.entity';
import { UserEntity } from '../user/user.entity';
import { CommentEntity } from '../comment/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BlogEntity, UserEntity, CommentEntity])],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}
