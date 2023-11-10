import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EpisodeEntity } from './episode.entity';
import { UserEntity } from '../user/user.entity';
import { CreateEpisodeDto } from './dto/createEpisode.dto';
import { EpisodeResponseInterface } from './types/episodeResponse.interface';
import { join } from 'path';
// import getVideoDurationInSeconds from 'get-video-duration';
// import { FunctionUtils } from 'src/utils/functions.utils';

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
    // const videoAddress = fileAddress.replace(/\\/g, '/');
    const videoURL = `/${fileAddress}`;
    // getVideoDurationInSeconds(videoURL).then((duration) => {
    //   console.log(duration);
    // });
    // console.log('seconds: ', seconds);
    // const time = FunctionUtils.getTime(await seconds);
    // console.log('time: ', time);
    delete createEpisodeDto.filename;
    delete createEpisodeDto.fileUploadPath;
    Object.assign(episode, createEpisodeDto);
    episode.time = '0';
    episode.videoAddress = videoURL;
    episode.user_id = user.id;
    return await this.episodeRepository.save(episode);
  }

  async buildEpisodeResponse(
    episode: EpisodeEntity,
  ): Promise<EpisodeResponseInterface> {
    return { episode };
  }
}
