import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntity } from './blog.entity';
import { UserEntity } from '../user/user.entity';
import { CommentEntity } from '../comment/comment.entity';
import { AdminEntity } from '../admin/admin.entity';
import { AdminAuthMiddleware } from 'src/admin/middlewares/auth.admin.middleware';
import { AdminService } from '../admin/admin.service';
import { BlogCategoryEntity } from '../blogCategory/blogCategory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BlogEntity,
      UserEntity,
      CommentEntity,
      AdminEntity,
      BlogCategoryEntity,
    ]),
  ],
  controllers: [BlogController],
  providers: [BlogService, AdminService],
})
export class BlogModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AdminAuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
