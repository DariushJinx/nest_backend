import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { ChapterEntity } from './chapter.entity';
import { ChapterController } from './chapter.controller';
import { ChapterService } from './chpater.service';
import { CourseEntity } from '../course/course.entity';
import { EpisodeEntity } from 'src/episode/episode.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChapterEntity,
      UserEntity,
      CourseEntity,
      EpisodeEntity,
    ]),
  ],
  controllers: [ChapterController],
  providers: [ChapterService],
})
export class ChapterModule {}
