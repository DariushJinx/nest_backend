import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { AuthGuard } from 'src/user/guard/auth.guard';
import { BackendValidationPipe } from 'src/shared/pipes/backendValidation.pipe';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/category/middlewares/multer';
import { User } from 'src/decorators/user.decorators';
import { UserEntity } from 'src/user/user.entity';
import { CreateCourseDto } from './dto/course.dto';
import { CoursesResponseInterface } from './types/coursesResponse.interface';
import { CourseResponseInterface } from './types/courseResponse.interface';
import { DeleteResult } from 'typeorm';
import { UpdateCourseDto } from './dto/updateCourse.dto';

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post('add')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  async createCourse(
    @User() currentUser: UserEntity,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createCourseDto: CreateCourseDto,
    @Body('chapterIds') chapterIds: number[],
  ) {
    const course = await this.courseService.createCourse(
      currentUser,
      createCourseDto,
      files,
      chapterIds,
    );
    return await this.courseService.buildCourseResponse(course);
  }

  @Get('list')
  async findAllCourses(
    @User() currentUser: number,
    @Query() query: any,
  ): Promise<CoursesResponseInterface> {
    return await this.courseService.findAllCourses(currentUser, query);
  }

  @Get(':id')
  async getOneCourse(
    @Param('id') id: number,
  ): Promise<CourseResponseInterface> {
    const course = await this.courseService.currentCourse(id);
    return await this.courseService.buildCourseResponses(course);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  async deleteOneCourse(@Param('slug') slug: string): Promise<DeleteResult> {
    return await this.courseService.deleteOneCourseWithSlug(slug);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  async updateOneCourseWithId(
    @Param('id') id: number,
    @User('id') currentUserID: number,
    @Body('') updateCourseDto: UpdateCourseDto,
  ): Promise<CourseResponseInterface> {
    const course = await this.courseService.updateCourse(
      id,
      currentUserID,
      updateCourseDto,
    );
    return await this.courseService.buildCourseResponse(course);
  }

  @Put(':courseId/favorite')
  @UseGuards(AuthGuard)
  async InsertCourseToFavorite(
    @Param('courseId') courseId: number,
    @User('id') currentUser: number,
  ): Promise<CourseResponseInterface> {
    const course = await this.courseService.favoriteCourse(
      courseId,
      currentUser,
    );
    return await this.courseService.buildCourseResponse(course);
  }

  @Delete(':courseId/favorite')
  @UseGuards(AuthGuard)
  async deleteCourseFromFavorite(
    @User('id') currentUser: number,
    @Param('courseId') courseId: number,
  ) {
    const course = await this.courseService.deleteCourseFromFavorite(
      courseId,
      currentUser,
    );
    return await this.courseService.buildCourseResponse(course);
  }
}
