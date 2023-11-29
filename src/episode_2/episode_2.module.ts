import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { EpisodeEntity_2 } from './episode_2.entity';
import { EpisodeController_2 } from './episode_2.controller';
import { EpisodeService_2 } from './episode_2.service';
import { ChapterEntity_2 } from '../chapter_2/chapter_2.entity';
import { CourseEntity_2 } from 'src/course_2/course_2.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EpisodeEntity_2,
      UserEntity,
      CourseEntity_2,
      ChapterEntity_2,
    ]),
  ],
  controllers: [EpisodeController_2],
  providers: [EpisodeService_2],
})
export class EpisodeModule_2 {}
