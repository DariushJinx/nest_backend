import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseEntity } from './course.entity';
import { DeleteResult, Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { CreateCourseDto } from './dto/course.dto';
import { FunctionUtils } from '../utils/functions.utils';
import slugify from 'slugify';
import { CourseResponseInterface } from './types/courseResponse.interface';
import { CoursesResponseInterface } from './types/coursesResponse.interface';
import { UpdateCourseDto } from './dto/updateCourse.dto';
import { ChapterEntity } from '../chapter/chapter.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ChapterEntity)
    private readonly chapterRepository: Repository<ChapterEntity>,
  ) {}

  async createCourse(
    currentUser: UserEntity,
    createCourseDto: CreateCourseDto,
    files: Express.Multer.File[],
    chapterIds: number[],
  ): Promise<CourseEntity> {
    const chapters = await this.chapterRepository.findByIds(chapterIds);
    const course = new CourseEntity();
    const images = FunctionUtils.ListOfImagesForRequest(
      files,
      createCourseDto.fileUploadPath,
    );
    Object.assign(course, createCourseDto);
    course.teacher = currentUser;
    course.chapters = chapters;
    if (Number(createCourseDto.price) > 0 && createCourseDto.type === 'free') {
      throw new HttpException(
        'برای دوره ی رایگان نمیتوان قیمت ثبت کرد',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      Number(createCourseDto.price) === 0 &&
      createCourseDto.type !== 'free'
    ) {
      throw new HttpException(
        'برای دوره ی غیر رایگان باید قیمت تعیین کرد',
        HttpStatus.BAD_REQUEST,
      );
    }
    delete course.teacher.password;
    course.slug = this.getSlug(createCourseDto.title);
    course.images = images;
    return await this.courseRepository.save(course);
  }

  async findAllCourses(
    currentUser: number,
    query: any,
  ): Promise<CoursesResponseInterface> {
    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.teacher', 'teacher');

    if (query.search) {
      queryBuilder.andWhere('course.tags LIKE :search', {
        search: `%${query.search}`,
      });
    }

    if (query.tag) {
      queryBuilder.andWhere('course.tags LIKE :tag', {
        tag: `%${query.tag}`,
      });
    }

    if (query.teacher) {
      const teacher = await this.userRepository.findOne({
        where: { username: query.teacher },
      });
      queryBuilder.andWhere('course.teacherId = :id', {
        id: teacher.id,
      });
    }

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    queryBuilder.orderBy('course.createdAt', 'DESC');

    const coursesCount = await queryBuilder.getCount();
    const courses = await queryBuilder.getMany();
    courses.map((course) => delete course.teacher.password);
    return { courses, coursesCount };
  }

  async currentCourse(id: number) {
    const course = await this.courseRepository.findOne({
      where: { id: id },
    });

    delete course.teacher.password;
    return course;
  }

  async getOneCourseWithSlug(slug: string): Promise<CourseEntity> {
    const product = await this.courseRepository.findOne({
      where: { slug: slug },
    });

    return product;
  }

  async deleteOneCourseWithSlug(slug: string): Promise<DeleteResult> {
    const course = await this.getOneCourseWithSlug(slug);
    if (!course) {
      throw new HttpException('دوره مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }
    if (course.teacher.role !== 'ADMIN') {
      throw new HttpException(
        'شما مجاز به حذف دوره نیستید',
        HttpStatus.FORBIDDEN,
      );
    }

    return await this.courseRepository.delete({ slug });
  }

  async updateCourse(
    id: number,
    currentUserID: number,
    updateCourseDto: UpdateCourseDto,
  ) {
    const course = await this.currentCourse(id);

    if (!course) {
      throw new HttpException('course does not exist', HttpStatus.NOT_FOUND);
    }

    if (course.teacher.id !== currentUserID) {
      throw new HttpException('you are not an teacher', HttpStatus.FORBIDDEN);
    }

    Object.assign(course, updateCourseDto);

    if (
      Number(updateCourseDto.price) > 0 &&
      course.type === 'free' &&
      updateCourseDto.type === 'free'
    ) {
      throw new HttpException(
        'برای دوره ی رایگان نمیتوان قیمت ثبت کرد',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      Number(updateCourseDto.price) === 0 &&
      course.type !== 'free' &&
      updateCourseDto.type !== 'free'
    ) {
      throw new HttpException(
        'برای دوره ی غیر رایگان باید قیمت تعیین کرد',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.courseRepository.save(course);
  }

  async favoriteCourse(courseId: number, currentUser: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUser },
      relations: ['favoriteCourses'],
    });
    const course = await this.currentCourse(courseId);

    const isNotFavorite =
      user.favoriteCourses.findIndex(
        (courseInFavorite) => courseInFavorite.id === course.id,
      ) === -1;

    if (isNotFavorite) {
      user.favoriteCourses.push(course);
      course.favoritesCount++;
      await this.userRepository.save(user);
      await this.courseRepository.save(course);
    }

    return course;
  }

  async deleteCourseFromFavorite(courseId: number, currentUser: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUser },
      relations: ['favoriteCourses'],
    });
    const course = await this.currentCourse(courseId);

    const courseIndex = user.favoriteCourses.findIndex(
      (courseInFavorite) => courseInFavorite.id === course.id,
    );

    if (courseIndex >= 0) {
      user.favoriteCourses.splice(courseIndex, 1);
      if (course.favoritesCount < 0) {
        course.favoritesCount = 0;
      }
      course.favoritesCount--;
      await this.userRepository.save(user);
      await this.courseRepository.save(course);
    }
    return course;
  }

  async buildCourseResponse(
    course: CourseEntity,
  ): Promise<CourseResponseInterface> {
    return { course };
  }

  async buildCourseResponses(course: CourseEntity) {
    return {
      course: {
        ...course,
      },
    };
  }

  private getSlug(title: string): string {
    return (
      slugify(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0)
    );
  }
}
