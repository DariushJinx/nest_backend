import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { join } from 'path';
import { FunctionUtils } from 'src/utils/functions.utils';
import getVideoDurationInSeconds from 'get-video-duration';
import { EpisodeEntity_2 } from './episode_2.entity';
import { ChapterEntity_2 } from '../chapter_2/chapter_2.entity';
import { EpisodesResponseInterface_2 } from './types/episodesResponse_2.interface';
import { UpdateEpisodeDto_2 } from './dto/updateEpisode_2.dto';
import { EpisodeResponseInterface_2 } from './types/episodeResponse_2.interface';
import { CreateEpisodeDto_2 } from './dto/createEpisode_2.dto';

@Injectable()
export class EpisodeService_2 {
  constructor(
    @InjectRepository(EpisodeEntity_2)
    private readonly episodeRepository: Repository<EpisodeEntity_2>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ChapterEntity_2)
    private readonly chapterRepository: Repository<ChapterEntity_2>,
  ) {}

  async createEpisode(
    createEpisodeDto: CreateEpisodeDto_2,
    user: UserEntity,
    file: Express.Multer.File,
  ) {
    const chapter = await this.chapterRepository.findOne({
      where: { id: +createEpisodeDto.chapter_id },
    });
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
    episode.user_id = user.id;
    if (chapter.course_id.teacher.id !== episode.user_id) {
      throw new HttpException(
        'شما مجاز به ثبت قسمت برای این فصل نیستید',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return await this.episodeRepository.save(episode);
  }

  async findAllEpisodes(
    currentUser: number,
    query: any,
  ): Promise<EpisodesResponseInterface_2> {
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

    delete episode.chapter_id.course_id.teacher.password;

    return episode;
  }

  async deleteOneEpisodeWithID(
    id: number,
    user: UserEntity,
  ): Promise<DeleteResult> {
    const chapter = await this.currentEpisode(id);
    const userResult = await this.userRepository.findOne({
      where: { id: chapter.user_id },
    });

    if (!chapter) {
      throw new HttpException('قسمت مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }
    if (userResult.role !== user.role) {
      throw new HttpException(
        'شما مجاز به حذف قسمت نیستید',
        HttpStatus.FORBIDDEN,
      );
    }

    return await this.episodeRepository.delete({ id });
  }

  async updateEpisode(
    id: number,
    currentUserID: number,
    file: Express.Multer.File,
    updateEpisodeDto: UpdateEpisodeDto_2,
  ) {
    const episode = await this.currentEpisode(id);

    const fileAddress = join(updateEpisodeDto.fileUploadPath, file.filename);
    const videoURL = `/${fileAddress}`;

    if (!episode) {
      throw new HttpException('episode does not exist', HttpStatus.NOT_FOUND);
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
