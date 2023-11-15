import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  Get,
  Query,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from 'src/user/guard/auth.guard';
import { BackendValidationPipe } from 'src/shared/pipes/backendValidation.pipe';
import { User } from 'src/decorators/user.decorators';
import { UserEntity } from 'src/user/user.entity';
import { CreateOffDto } from './dto/createOff.dto';
import { OffService } from './off.service';
import { offsResponseInterface } from './types/offsResponse.interface';
import { OffResponseInterface } from './types/offResponse.interface';
import { UpdateOffDto } from './dto/updateOff.dto';
import { DeleteResult } from 'typeorm';
import { GetOneOffDto } from './dto/getOneOff.dto';
import { SetDiscountOnAllDto } from './dto/setOffAll.dto';

@Controller('off')
export class OffController {
  constructor(private readonly offService: OffService) {}

  @Post('add')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async createEpisode(
    @User() user: UserEntity,
    @Body() createOffDto: CreateOffDto,
  ) {
    const off = await this.offService.createOff(user, createOffDto);
    return await this.offService.buildOffResponse(off);
  }

  @Post('setAllCourses')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async setOffForAllCourses(
    @Body('') setDiscountOnAllDto: SetDiscountOnAllDto,
  ) {
    await this.offService.setOffForAllCourses(setDiscountOnAllDto);

    return {
      message: 'تخفیف روی تمامی دوره ها ثبت شد',
    };
  }

  @Post('setAllProducts')
  async setOff(@Body('') setDiscount: SetDiscountOnAllDto) {
    await this.offService.setOffForAllProducts(setDiscount);
    return {
      message: 'تخفیف روی تمامی محصولات ثبت شد',
    };
  }

  @Get('list')
  async findAllOffs(
    @User() currentUser: number,
    @Query() query: any,
  ): Promise<offsResponseInterface> {
    return await this.offService.findAllOffs(currentUser, query);
  }

  @Get('product/:code')
  async OffuseUsesForProduct(
    @Param('code') code: string,
    @Body() getOneOffDto: GetOneOffDto,
  ) {
    const off = await this.offService.OffuseUsesForProduct(code, getOneOffDto);
    return await this.offService.buildOffResponse(off);
  }

  @Get('course/:code')
  async OffuseUsesForCourse(
    @Param('code') code: string,
    @Body() getOneOffDto: GetOneOffDto,
  ) {
    const off = await this.offService.OffuseUsesForCourse(code, getOneOffDto);
    return await this.offService.buildOffResponse(off);
  }

  @Get(':id')
  async getOneChapter(@Param('id') id: number): Promise<OffResponseInterface> {
    const off = await this.offService.currentOff(id);
    return await this.offService.buildOffResponse(off);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async updateOneChapterWithId(
    @Param('id') id: number,
    @User('id') currentUserID: number,
    @Body('') updateChapterDto: UpdateOffDto,
  ): Promise<OffResponseInterface> {
    const off = await this.offService.updateOff(
      id,
      currentUserID,
      updateChapterDto,
    );
    return await this.offService.buildOffResponse(off);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteOneChapter(
    @Param('id') id: number,
    @User() user: UserEntity,
  ): Promise<DeleteResult> {
    return await this.offService.deleteOneOffWithID(id, user);
  }
}
