import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { EpisodeService } from './episode.service';
import { AuthGuard } from 'src/user/guard/auth.guard';
import { BackendValidationPipe } from 'src/shared/pipes/backendValidation.pipe';
import { User } from 'src/decorators/user.decorators';
import { UserEntity } from 'src/user/user.entity';
import { CreateEpisodeDto } from './dto/createEpisode.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/category/middlewares/multer';

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
}
