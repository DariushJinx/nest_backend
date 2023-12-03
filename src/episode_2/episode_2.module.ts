import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { EpisodeEntity_2 } from './episode_2.entity';
import { EpisodeController_2 } from './episode_2.controller';
import { EpisodeService_2 } from './episode_2.service';
import { ChapterEntity_2 } from '../chapter_2/chapter_2.entity';
import { CourseEntity_2 } from '../course_2/course_2.entity';
import { AdminAuthMiddleware } from '../admin/middlewares/auth.admin.middleware';
import { AdminService } from '../admin/admin.service';
import { AdminEntity } from '../admin/admin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EpisodeEntity_2,
      UserEntity,
      CourseEntity_2,
      ChapterEntity_2,
      AdminEntity,
    ]),
  ],
  controllers: [EpisodeController_2],
  providers: [EpisodeService_2, AdminService],
})
export class EpisodeModule_2 implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AdminAuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
