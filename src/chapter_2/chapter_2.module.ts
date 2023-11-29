import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { ChapterService_2 } from './chpater_2.service';
import { ChapterEntity_2 } from './chapter_2.entity';
import { ChapterController_2 } from './chapter_2.controller';
import { CourseEntity_2 } from 'src/course_2/course_2.entity';
import { EpisodeEntity_2 } from 'src/episode_2/episode_2.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChapterEntity_2,
      UserEntity,
      CourseEntity_2,
      EpisodeEntity_2,
    ]),
  ],
  controllers: [ChapterController_2],
  providers: [ChapterService_2],
})
export class ChapterModule_2 {}
