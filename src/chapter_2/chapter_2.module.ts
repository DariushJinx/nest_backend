import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { ChapterService_2 } from './chpater_2.service';
import { ChapterEntity_2 } from './chapter_2.entity';
import { ChapterController_2 } from './chapter_2.controller';
import { CourseEntity_2 } from '../course_2/course_2.entity';
import { EpisodeEntity_2 } from '../episode_2/episode_2.entity';
import { AdminAuthMiddleware } from '../admin/middlewares/auth.admin.middleware';
import { AdminService } from '../admin/admin.service';
import { AdminEntity } from '../admin/admin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChapterEntity_2,
      UserEntity,
      CourseEntity_2,
      EpisodeEntity_2,
      AdminEntity,
    ]),
  ],
  controllers: [ChapterController_2],
  providers: [ChapterService_2, AdminService],
})
export class ChapterModule_2 implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AdminAuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
