import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { CourseEntity_2 } from './course_2.entity';
import { CourseController_2 } from './course_2.controller';
import { CourseService_2 } from './course_2.service';
import { CommentEntity } from '../comment/comment.entity';
import { CourseCategoryEntity } from '../courseCategory/CourseCategory.entity';
import { ChapterEntity_2 } from '../chapter_2/chapter_2.entity';
import { AdminEntity } from '../admin/admin.entity';
import { AdminAuthMiddleware } from '../admin/middlewares/auth.admin.middleware';
import { AdminService } from '../admin/admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourseEntity_2,
      UserEntity,
      ChapterEntity_2,
      CommentEntity,
      CourseCategoryEntity,
      AdminEntity,
    ]),
  ],
  controllers: [CourseController_2],
  providers: [CourseService_2, AdminService],
})
export class CourseModule_2 {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AdminAuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
