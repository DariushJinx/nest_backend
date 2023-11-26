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
import { BlogCategoryEntity } from './blogCategory.entity';
import { BlogCategoryController } from './blogCategory.controller';
import { BlogCategoryService } from './blogCategory.service';

@Module({
  imports: [TypeOrmModule.forFeature([BlogCategoryEntity, AdminEntity])],
  controllers: [BlogCategoryController],
  providers: [BlogCategoryService, AdminService],
})
export class BlogCategoryModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AdminAuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
