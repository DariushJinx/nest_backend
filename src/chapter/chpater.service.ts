import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChapterEntity } from './chapter.entity';
import { DeleteResult, Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { CreateChapterDto } from './dto/createChpater.dto';
import { ChapterResponseInterface } from './types/chpaterResponse.interface';
import { CourseEntity } from '../course/course.entity';
import { ChaptersResponseInterface } from './types/chaptersResponse.interface';

@Injectable()
export class ChapterService {
  constructor(
    @InjectRepository(ChapterEntity)
    private readonly chapterRepository: Repository<ChapterEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
  ) {}

  async createChapter(
    createChapterDto: CreateChapterDto,
    user: UserEntity,
  ): Promise<ChapterEntity> {
    const chapter = new ChapterEntity();
    Object.assign(chapter, createChapterDto);
    chapter.user_id = user.id;
    return await this.chapterRepository.save(chapter);
  }

  async findAllChapters(
    currentUser: number,
    query: any,
  ): Promise<ChaptersResponseInterface> {
    const queryBuilder = this.chapterRepository.createQueryBuilder('chapter');

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    queryBuilder.orderBy('chapter.createdAt', 'DESC');

    const chaptersCount = await queryBuilder.getCount();
    const chapters = await queryBuilder.getMany();
    return { chapters, chaptersCount };
  }

  async currentChapter(id: number) {
    return await this.chapterRepository.findOne({
      where: { id: id },
    });
  }

  async deleteOneChapterWithID(
    id: number,
    user: UserEntity,
  ): Promise<DeleteResult> {
    const chapter = await this.currentChapter(id);
    const userResult = await this.userRepository.findOne({
      where: { id: chapter.user_id },
    });

    if (!chapter) {
      throw new HttpException('فصل مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }
    if (userResult.role !== user.role) {
      throw new HttpException(
        'شما مجاز به حذف فصل نیستید',
        HttpStatus.FORBIDDEN,
      );
    }

    return await this.chapterRepository.delete({ id });
  }

  async buildChapterResponse(
    chapter: ChapterEntity,
  ): Promise<ChapterResponseInterface> {
    return { chapter };
  }
}