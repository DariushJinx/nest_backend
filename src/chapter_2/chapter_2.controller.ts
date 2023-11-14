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
  Put,
} from '@nestjs/common';
import { AuthGuard } from 'src/user/guard/auth.guard';
import { BackendValidationPipe } from 'src/shared/pipes/backendValidation.pipe';
import { User } from 'src/decorators/user.decorators';
import { UserEntity } from 'src/user/user.entity';
import { DeleteResult } from 'typeorm';
import { ChapterService_2 } from './chpater_2.service';
import { CreateChapterDto_2 } from './dto/createChpater_2.dto';
import { ChaptersResponseInterface_2 } from './types/chaptersResponse_2.interface';
import { ChapterResponseInterface_2 } from './types/chpaterResponse_2.interface';
import { UpdateChapterDto_2 } from './dto/updateChapter_2.dto';

@Controller('chapter_2')
export class ChapterController_2 {
  constructor(private readonly chapterService: ChapterService_2) {}

  @Post('add')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async createChapter(
    @User() user: UserEntity,
    @Body() createChapterDto: CreateChapterDto_2,
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
  ): Promise<ChaptersResponseInterface_2> {
    return await this.chapterService.findAllChapters(currentUser, query);
  }

  @Get(':id')
  async getOneChapter(
    @Param('id') id: number,
  ): Promise<ChapterResponseInterface_2> {
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

  @Put(':id')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async updateOneChapterWithId(
    @Param('id') id: number,
    @User('id') currentUserID: number,
    @Body('') updateChapterDto: UpdateChapterDto_2,
  ): Promise<ChapterResponseInterface_2> {
    const chapter = await this.chapterService.updateChapter(
      id,
      currentUserID,
      updateChapterDto,
    );
    return await this.chapterService.buildChapterResponse(chapter);
  }
}
