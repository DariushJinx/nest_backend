import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity } from './course.entity';
import { UserEntity } from '../user/user.entity';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { ChapterEntity } from '../chapter/chapter.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseEntity, UserEntity, ChapterEntity]),
  ],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
