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
import { BackendValidationPipe } from 'src/shared/pipes/backendValidation.pipe';
import { ChapterService_2 } from './chpater_2.service';
import { CreateChapterDto_2 } from './dto/createChpater_2.dto';
import { ChaptersResponseInterface_2 } from './types/chaptersResponse_2.interface';
import { ChapterResponseInterface_2 } from './types/chpaterResponse_2.interface';
import { UpdateChapterDto_2 } from './dto/updateChapter_2.dto';
import { AdminAuthGuard } from '../admin/guard/adminAuth.guard';
import { Admin } from '../decorators/admin.decorators';
import { AdminEntity } from '../admin/admin.entity';

@Controller('chapter_2')
export class ChapterController_2 {
  constructor(private readonly chapterService: ChapterService_2) {}

  @Post('add')
  @UseGuards(AdminAuthGuard)
  @UsePipes(new BackendValidationPipe())
  async createChapter(
    @Admin() admin: AdminEntity,
    @Body() createChapterDto: CreateChapterDto_2,
  ) {
    const chapter = await this.chapterService.createChapter(
      createChapterDto,
      admin,
    );
    return await this.chapterService.buildChapterResponse(chapter);
  }

  @Get('list')
  async findAllChapters(
    @Query() query: any,
  ): Promise<ChaptersResponseInterface_2> {
    return await this.chapterService.findAllChapters(query);
  }

  @Get(':id')
  async getOneChapter(
    @Param('id') id: number,
  ): Promise<ChapterResponseInterface_2> {
    const chapter = await this.chapterService.currentChapter(id);
    return await this.chapterService.buildChapterResponse(chapter);
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  async deleteOneChapter(
    @Param('id') id: number,
    @Admin() admin: AdminEntity,
  ): Promise<{
    message: string;
  }> {
    await this.chapterService.deleteOneChapterWithID(id, admin);

    return {
      message: 'دوره مورد نظر با موفقیت حذف شد',
    };
  }

  @Put(':id')
  @UseGuards(AdminAuthGuard)
  @UsePipes(new BackendValidationPipe())
  async updateOneChapterWithId(
    @Param('id') id: number,
    @Admin('id') AdminID: number,
    @Body('') updateChapterDto: UpdateChapterDto_2,
  ): Promise<ChapterResponseInterface_2> {
    const chapter = await this.chapterService.updateChapter(
      id,
      AdminID,
      updateChapterDto,
    );
    return await this.chapterService.buildChapterResponse(chapter);
  }
}
