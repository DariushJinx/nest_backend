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
import { EpisodeService } from './episode.service';
import { AuthGuard } from 'src/user/guard/auth.guard';
import { BackendValidationPipe } from 'src/shared/pipes/backendValidation.pipe';
import { User } from 'src/decorators/user.decorators';
import { UserEntity } from 'src/user/user.entity';
import { CreateEpisodeDto } from './dto/createEpisode.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/category/middlewares/multer';
import { EpisodesResponseInterface } from './types/episodesResponse.interface';
import { EpisodeResponseInterface } from './types/episodeResponse.interface';
import { DeleteResult } from 'typeorm';
import { UpdateEpisodeDto } from './dto/updateEpisode.dto';

@Controller('episode')
export class EpisodeController {
  constructor(private readonly episodeService: EpisodeService) {}

  @Post('add')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  @UseInterceptors(FileInterceptor('video', multerConfig))
  async createEpisode(
    @User() user: UserEntity,
    @UploadedFile() file: Express.Multer.File,
    @Body() createEpisodeDto: CreateEpisodeDto,
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
  ): Promise<EpisodesResponseInterface> {
    return await this.episodeService.findAllEpisodes(currentUser, query);
  }

  @Get(':id')
  async getOneEpisode(
    @Param('id') id: number,
  ): Promise<EpisodeResponseInterface> {
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
    @Body('') updateEpisodeDto: UpdateEpisodeDto,
  ): Promise<EpisodeResponseInterface> {
    const episode = await this.episodeService.updateEpisode(
      id,
      currentUserID,
      file,
      updateEpisodeDto,
    );
    return await this.episodeService.buildEpisodeResponse(episode);
  }
}
