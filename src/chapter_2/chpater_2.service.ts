import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { EpisodeEntity } from '../episode/episode.entity';
import { CreateChapterDto_2 } from './dto/createChpater_2.dto';
import { ChapterEntity_2 } from './chapter_2.entity';
import { ChaptersResponseInterface_2 } from './types/chaptersResponse_2.interface';
import { UpdateChapterDto_2 } from './dto/updateChapter_2.dto';
import { ChapterResponseInterface_2 } from './types/chpaterResponse_2.interface';
import { CourseEntity_2 } from '../course_2/course_2.entity';

@Injectable()
export class ChapterService_2 {
  constructor(
    @InjectRepository(ChapterEntity_2)
    private readonly chapterRepository: Repository<ChapterEntity_2>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CourseEntity_2)
    private readonly courseRepository: Repository<CourseEntity_2>,
    @InjectRepository(EpisodeEntity)
    private readonly episodeRepository: Repository<EpisodeEntity>,
  ) {}

  async createChapter(
    createChapterDto: CreateChapterDto_2,
    user: UserEntity,
  ): Promise<ChapterEntity_2> {
    const course = await this.courseRepository.findOne({
      where: { id: +createChapterDto.course_id },
    });
    const chapter = new ChapterEntity_2();
    Object.assign(chapter, createChapterDto);

    chapter.user_id = user.id;
    if (course.teacher.id !== chapter.user_id) {
      throw new HttpException(
        'شما مجاز به ثبت فصل برای این دوره نیستید',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return await this.chapterRepository.save(chapter);
  }

  async findAllChapters(
    currentUser: number,
    query: any,
  ): Promise<ChaptersResponseInterface_2> {
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
    const chapter = await this.chapterRepository.findOne({
      where: { id: id },
      relations: ['episodes'],
    });

    delete chapter.course_id;
    chapter.episodes.map((episode) => delete episode.chapter_id);

    return chapter;
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

  async updateChapter(
    id: number,
    currentUserID: number,
    updateChapterDto: UpdateChapterDto_2,
  ) {
    const chapter = await this.currentChapter(id);

    if (!chapter) {
      throw new HttpException('chapter does not exist', HttpStatus.NOT_FOUND);
    }

    if (chapter.user_id !== currentUserID) {
      throw new HttpException(
        'شما مجاز به تغییر فصل نیستید',
        HttpStatus.FORBIDDEN,
      );
    }

    Object.assign(chapter, updateChapterDto);

    return await this.chapterRepository.save(chapter);
  }

  async buildChapterResponse(
    chapter: ChapterEntity_2,
  ): Promise<ChapterResponseInterface_2> {
    return { chapter };
  }
}
