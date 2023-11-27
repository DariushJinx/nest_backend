import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity } from './course.entity';
import { UserEntity } from '../user/user.entity';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { ChapterEntity } from '../chapter/chapter.entity';
import { CourseCategoryEntity } from '../courseCategory/CourseCategory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourseEntity,
      UserEntity,
      ChapterEntity,
      CourseCategoryEntity,
    ]),
  ],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
