import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { join } from 'path';
import { FunctionUtils } from '../utils/functions.utils';
import getVideoDurationInSeconds from 'get-video-duration';
import { EpisodeEntity_2 } from './episode_2.entity';
import { ChapterEntity_2 } from '../chapter_2/chapter_2.entity';
import { EpisodesResponseInterface_2 } from './types/episodesResponse_2.interface';
import { UpdateEpisodeDto_2 } from './dto/updateEpisode_2.dto';
import { EpisodeResponseInterface_2 } from './types/episodeResponse_2.interface';
import { CreateEpisodeDto_2 } from './dto/createEpisode_2.dto';
import { AdminEntity } from '../admin/admin.entity';

@Injectable()
export class EpisodeService_2 {
  constructor(
    @InjectRepository(EpisodeEntity_2)
    private readonly episodeRepository: Repository<EpisodeEntity_2>,
    @InjectRepository(ChapterEntity_2)
    private readonly chapterRepository: Repository<ChapterEntity_2>,
  ) {}

  async createEpisode(
    createEpisodeDto: CreateEpisodeDto_2,
    admin: AdminEntity,
    file: Express.Multer.File,
  ) {
    const chapter = await this.chapterRepository.findOne({
      where: { id: +createEpisodeDto.chapter_id },
    });

    if (!chapter) {
      throw new HttpException('فصل مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }
    const episode = new EpisodeEntity_2();
    const fileAddress = join(createEpisodeDto.fileUploadPath, file.filename);
    const videoURL = `http://localhost:3333/${fileAddress}`;
    const duration = await getVideoDurationInSeconds(videoURL);
    const time = FunctionUtils.getTime(duration);
    delete createEpisodeDto.filename;
    delete createEpisodeDto.fileUploadPath;
    Object.assign(episode, createEpisodeDto);
    episode.time = time;
    episode.videoAddress = videoURL;
    episode.user_id = admin.id;
    if (chapter.course_id.teacher.id !== episode.user_id) {
      throw new HttpException(
        'شما مجاز به ثبت قسمت برای این فصل نیستید',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return await this.episodeRepository.save(episode);
  }

  async findAllEpisodes(query: any): Promise<EpisodesResponseInterface_2> {
    const queryBuilder = this.episodeRepository.createQueryBuilder('episode');

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    queryBuilder.orderBy('episode.createdAt', 'DESC');

    const episodesCount = await queryBuilder.getCount();
    const episodes = await queryBuilder.getMany();
    return { episodes, episodesCount };
  }

  async currentEpisode(id: number) {
    const episode = await this.episodeRepository.findOne({
      where: { id: id },
    });

    if (!episode) {
      throw new HttpException('قسمت مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }

    delete episode.chapter_id.course_id;

    return episode;
  }

  async deleteOneEpisodeWithID(
    id: number,
    admin: AdminEntity,
  ): Promise<{
    message: string;
  }> {
    const chapter = await this.currentEpisode(id);

    if (!chapter) {
      throw new HttpException('قسمت مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }
    if (!admin) {
      throw new HttpException(
        'شما مجاز به حذف قسمت نیستید',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.episodeRepository.delete({ id });

    return {
      message: 'قسمت مورد نظر با موفقیت حذف شد',
    };
  }

  async updateEpisode(
    id: number,
    currentUserID: number,
    file: Express.Multer.File,
    updateEpisodeDto: UpdateEpisodeDto_2,
  ) {
    const episode = await this.currentEpisode(id);

    const fileAddress = join(updateEpisodeDto.fileUploadPath, file.filename);
    const videoURL = `http://localhost:3333/${fileAddress}`;

    if (!episode) {
      throw new HttpException('قسمت مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }

    if (episode.user_id !== currentUserID) {
      throw new HttpException(
        'شما مجاز به تغییر فصل نیستید',
        HttpStatus.FORBIDDEN,
      );
    }
    delete updateEpisodeDto.filename;
    delete updateEpisodeDto.fileUploadPath;
    Object.assign(episode, updateEpisodeDto);
    episode.videoAddress = videoURL;
    return await this.episodeRepository.save(episode);
  }

  async buildEpisodeResponse(
    episode: EpisodeEntity_2,
  ): Promise<EpisodeResponseInterface_2> {
    return { episode };
  }
}
