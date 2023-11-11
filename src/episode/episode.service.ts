import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { EpisodeEntity } from './episode.entity';
import { UserEntity } from '../user/user.entity';
import { CreateEpisodeDto } from './dto/createEpisode.dto';
import { EpisodeResponseInterface } from './types/episodeResponse.interface';
import { join } from 'path';
import { EpisodesResponseInterface } from './types/episodesResponse.interface';
import { UpdateEpisodeDto } from './dto/updateEpisode.dto';
import { FunctionUtils } from 'src/utils/functions.utils';
import getVideoDurationInSeconds from 'get-video-duration';

@Injectable()
export class EpisodeService {
  constructor(
    @InjectRepository(EpisodeEntity)
    private readonly episodeRepository: Repository<EpisodeEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createEpisode(
    createEpisodeDto: CreateEpisodeDto,
    user: UserEntity,
    file: Express.Multer.File,
  ) {
    const episode = new EpisodeEntity();
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
    return await this.episodeRepository.save(episode);
  }

  async findAllEpisodes(
    currentUser: number,
    query: any,
  ): Promise<EpisodesResponseInterface> {
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
    return await this.episodeRepository.findOne({
      where: { id: id },
    });
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
    updateEpisodeDto: UpdateEpisodeDto,
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
    episode: EpisodeEntity,
  ): Promise<EpisodeResponseInterface> {
    return { episode };
  }
}
