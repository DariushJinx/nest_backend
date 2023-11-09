import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UsePipes,
  Param,
  Delete,
} from '@nestjs/common';
import { ChapterService } from './chpater.service';
import { AuthGuard } from 'src/user/guard/auth.guard';
import { BackendValidationPipe } from 'src/shared/pipes/backendValidation.pipe';
import { User } from 'src/decorators/user.decorators';
import { UserEntity } from 'src/user/user.entity';
import { CreateChapterDto } from './dto/createChpater.dto';
import { ChaptersResponseInterface } from './types/chaptersResponse.interface';
import { ChapterResponseInterface } from './types/chpaterResponse.interface';
import { DeleteResult } from 'typeorm';

@Controller('chapter')
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  @Post('add')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async createChapter(
    @User() user: UserEntity,
    @Body() createChapterDto: CreateChapterDto,
  ) {
    const chapter = await this.chapterService.createChapter(
      createChapterDto,
      user,
    );
    return await this.chapterService.buildChapterResponse(chapter);
  }

  @Get('list')
  async findAllChapters(
    @User() currentUser: number,
    @Query() query: any,
  ): Promise<ChaptersResponseInterface> {
    return await this.chapterService.findAllChapters(currentUser, query);
  }

  @Get(':id')
  async getOneChapter(
    @Param('id') id: number,
  ): Promise<ChapterResponseInterface> {
    const chapter = await this.chapterService.currentChapter(id);
    return await this.chapterService.buildChapterResponse(chapter);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteOneChapter(
    @Param('id') id: number,
    @User() user: UserEntity,
  ): Promise<DeleteResult> {
    return await this.chapterService.deleteOneChapterWithID(id, user);
  }
}
