import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity } from './course.entity';
import { UserEntity } from 'src/user/user.entity';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';

@Module({
  imports: [TypeOrmModule.forFeature([CourseEntity, UserEntity])],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
