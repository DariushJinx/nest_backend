import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  UseInterceptors,
  UploadedFile,
  Get,
  Query,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { AuthGuard } from 'src/user/guard/auth.guard';
import { BackendValidationPipe } from 'src/shared/pipes/backendValidation.pipe';
import { User } from 'src/decorators/user.decorators';
import { UserEntity } from 'src/user/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/category/middlewares/multer';
import { DeleteResult } from 'typeorm';
import { EpisodeService_2 } from './episode_2.service';
import { CreateEpisodeDto_2 } from './dto/createEpisode_2.dto';
import { EpisodesResponseInterface_2 } from './types/episodesResponse_2.interface';
import { EpisodeResponseInterface_2 } from './types/episodeResponse_2.interface';
import { UpdateEpisodeDto_2 } from './dto/updateEpisode_2.dto';

@Controller('episode_2')
export class EpisodeController_2 {
  constructor(private readonly episodeService: EpisodeService_2) {}

  @Post('add')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  @UseInterceptors(FileInterceptor('video', multerConfig))
  async createEpisode(
    @User() user: UserEntity,
    @UploadedFile() file: Express.Multer.File,
    @Body() createEpisodeDto: CreateEpisodeDto_2,
  ) {
    const episode = await this.episodeService.createEpisode(
      createEpisodeDto,
      user,
      file,
    );
    return await this.episodeService.buildEpisodeResponse(episode);
  }

  @Get('list')
  async findAllEpisodes(
    @User() currentUser: number,
    @Query() query: any,
  ): Promise<EpisodesResponseInterface_2> {
    return await this.episodeService.findAllEpisodes(currentUser, query);
  }

  @Get(':id')
  async getOneEpisode(
    @Param('id') id: number,
  ): Promise<EpisodeResponseInterface_2> {
    const episode = await this.episodeService.currentEpisode(id);
    return await this.episodeService.buildEpisodeResponse(episode);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteOneEpisode(
    @Param('id') id: number,
    @User() user: UserEntity,
  ): Promise<DeleteResult> {
    return await this.episodeService.deleteOneEpisodeWithID(id, user);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  @UseInterceptors(FileInterceptor('video', multerConfig))
  async updateOneEpisodeWithId(
    @Param('id') id: number,
    @User('id') currentUserID: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('') updateEpisodeDto: UpdateEpisodeDto_2,
  ): Promise<EpisodeResponseInterface_2> {
    const episode = await this.episodeService.updateEpisode(
      id,
      currentUserID,
      file,
      updateEpisodeDto,
    );
    return await this.episodeService.buildEpisodeResponse(episode);
  }
}
