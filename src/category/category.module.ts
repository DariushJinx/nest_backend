import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from './category.entity';
import { AdminEntity } from '../admin/admin.entity';
import { AdminAuthMiddleware } from '../admin/middlewares/auth.admin.middleware';
import { AdminService } from '../admin/admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity, AdminEntity])],
  controllers: [CategoryController],
  providers: [CategoryService, AdminService],
})
export class CategoryModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AdminAuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
