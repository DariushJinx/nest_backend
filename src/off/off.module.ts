import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OffController } from './off.controller';
import { OffService } from './off.service';
import { OffEntity } from './off.entity';
import { ProductEntity } from '../product/product.entity';
import { CourseEntity_2 } from '../course_2/course_2.entity';
import { AdminEntity } from '../admin/admin.entity';
import { AdminAuthMiddleware } from '../admin/middlewares/auth.admin.middleware';
import { AdminService } from '../admin/admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      CourseEntity_2,
      OffEntity,
      AdminEntity,
    ]),
  ],
  controllers: [OffController],
  providers: [OffService, AdminService],
})
export class OffModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AdminAuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
