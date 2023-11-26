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
import { AuthGuard } from 'src/user/guard/auth.guard';
import { BackendValidationPipe } from 'src/shared/pipes/backendValidation.pipe';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/middlewares/multer';
import { User } from 'src/decorators/user.decorators';
import { UserEntity } from 'src/user/user.entity';
import { DeleteResult } from 'typeorm';
import { CourseService_2 } from './course_2.service';
import { CreateCourseDto_2 } from './dto/course_2.dto';
import { CoursesResponseInterface_2 } from './types/coursesResponse_2.interface';
import { CourseResponseInterface_2 } from './types/courseResponse_2.interface';
import { UpdateCourseDto_2 } from './dto/updateCourse_2.dto';

@Controller('course_2')
export class CourseController_2 {
  constructor(private readonly courseService: CourseService_2) {}

  @Post('add')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  async createCourse(
    @User() currentUser: UserEntity,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createCourseDto: CreateCourseDto_2,
  ) {
    const course = await this.courseService.createCourse(
      currentUser,
      createCourseDto,
      files,
    );
    return await this.courseService.buildCourseResponse(course);
  }

  @Get('list')
  async findAllCourses(
    @User() currentUser: number,
    @Query() query: any,
  ): Promise<CoursesResponseInterface_2> {
    return await this.courseService.findAllCourses(currentUser, query);
  }

  @Get('all_courses')
  async findAllCoursesWithRating(@User() user: UserEntity) {
    return await this.courseService.findAllCoursesWithRating(user);
  }

  @Get(':id')
  async getOneCourse(
    @Param('id') id: number,
  ): Promise<CourseResponseInterface_2> {
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
    @Body('') updateCourseDto: UpdateCourseDto_2,
  ): Promise<CourseResponseInterface_2> {
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
  ): Promise<CourseResponseInterface_2> {
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
