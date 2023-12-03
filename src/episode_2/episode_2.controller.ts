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
import { BackendValidationPipe } from 'src/shared/pipes/backendValidation.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/middlewares/multer';
import { EpisodeService_2 } from './episode_2.service';
import { CreateEpisodeDto_2 } from './dto/createEpisode_2.dto';
import { EpisodesResponseInterface_2 } from './types/episodesResponse_2.interface';
import { EpisodeResponseInterface_2 } from './types/episodeResponse_2.interface';
import { UpdateEpisodeDto_2 } from './dto/updateEpisode_2.dto';
import { AdminAuthGuard } from 'src/admin/guard/adminAuth.guard';
import { Admin } from 'src/decorators/admin.decorators';
import { AdminEntity } from 'src/admin/admin.entity';

@Controller('episode_2')
export class EpisodeController_2 {
  constructor(private readonly episodeService: EpisodeService_2) {}

  @Post('add')
  @UseGuards(AdminAuthGuard)
  @UsePipes(new BackendValidationPipe())
  @UseInterceptors(FileInterceptor('video', multerConfig))
  async createEpisode(
    @Admin() admin: AdminEntity,
    @UploadedFile() file: Express.Multer.File,
    @Body() createEpisodeDto: CreateEpisodeDto_2,
  ) {
    const episode = await this.episodeService.createEpisode(
      createEpisodeDto,
      admin,
      file,
    );
    return await this.episodeService.buildEpisodeResponse(episode);
  }

  @Get('list')
  async findAllEpisodes(
    @Query() query: any,
  ): Promise<EpisodesResponseInterface_2> {
    return await this.episodeService.findAllEpisodes(query);
  }

  @Get(':id')
  async getOneEpisode(
    @Param('id') id: number,
  ): Promise<EpisodeResponseInterface_2> {
    const episode = await this.episodeService.currentEpisode(id);
    return await this.episodeService.buildEpisodeResponse(episode);
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  async deleteOneEpisode(
    @Param('id') id: number,
    @Admin() admin: AdminEntity,
  ): Promise<{
    message: string;
  }> {
    await this.episodeService.deleteOneEpisodeWithID(id, admin);

    return {
      message: 'قسمت مورد نظر با موفقیت حذف شد',
    };
  }

  @Put(':id')
  @UseGuards(AdminAuthGuard)
  @UsePipes(new BackendValidationPipe())
  @UseInterceptors(FileInterceptor('video', multerConfig))
  async updateOneEpisodeWithId(
    @Param('id') id: number,
    @Admin('id') adminID: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('') updateEpisodeDto: UpdateEpisodeDto_2,
  ): Promise<EpisodeResponseInterface_2> {
    const episode = await this.episodeService.updateEpisode(
      id,
      adminID,
      file,
      updateEpisodeDto,
    );
    return await this.episodeService.buildEpisodeResponse(episode);
  }
}
