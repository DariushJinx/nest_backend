import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminEntity } from '../admin/admin.entity';
import { AdminAuthMiddleware } from '../admin/middlewares/auth.admin.middleware';
import { AdminService } from '../admin/admin.service';
import { CourseCategoryEntity } from './CourseCategory.entity';
import { CourseCategoryController } from './courseCategory.controller';
import { CourseCategoryService } from './courseCategory.service';

@Module({
  imports: [TypeOrmModule.forFeature([CourseCategoryEntity, AdminEntity])],
  controllers: [CourseCategoryController],
  providers: [CourseCategoryService, AdminService],
})
export class CourseCategoryModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AdminAuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
