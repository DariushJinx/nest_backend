import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { ChapterEntity } from '../chapter/chapter.entity';
import { CourseEntity_2 } from './course_2.entity';
import { CourseController_2 } from './course_2.controller';
import { CourseService_2 } from './course_2.service';
import { CommentEntity } from '../comment/comment.entity';
import { CourseCategoryEntity } from '../courseCategory/CourseCategory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourseEntity_2,
      UserEntity,
      ChapterEntity,
      CommentEntity,
      CourseCategoryEntity,
    ]),
  ],
  controllers: [CourseController_2],
  providers: [CourseService_2],
})
export class CourseModule_2 {}
