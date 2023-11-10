import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { CourseEntity } from '../course/course.entity';
import { EpisodeEntity } from './episode.entity';
import { EpisodeController } from './episode.controller';
import { EpisodeService } from './episode.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EpisodeEntity, UserEntity, CourseEntity]),
  ],
  controllers: [EpisodeController],
  providers: [EpisodeService],
})
export class EpisodeModule {}
