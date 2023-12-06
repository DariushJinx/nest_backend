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
import { BackendValidationPipe } from 'src/shared/pipes/backendValidation.pipe';
import { CreateOffDto } from './dto/createOff.dto';
import { OffService } from './off.service';
import { offsResponseInterface } from './types/offsResponse.interface';
import { OffResponseInterface } from './types/offResponse.interface';
import { UpdateOffDto } from './dto/updateOff.dto';
import { DeleteResult } from 'typeorm';
import { GetOneOffDto } from './dto/getOneOff.dto';
import { SetDiscountOnAllDto } from './dto/setOffAll.dto';
import { AdminAuthGuard } from 'src/admin/guard/adminAuth.guard';
import { Admin } from 'src/decorators/admin.decorators';
import { AdminEntity } from 'src/admin/admin.entity';

@Controller('off')
export class OffController {
  constructor(private readonly offService: OffService) {}

  @Post('add')
  @UseGuards(AdminAuthGuard)
  @UsePipes(new BackendValidationPipe())
  async createOff(
    @Admin() admin: AdminEntity,
    @Body() createOffDto: CreateOffDto,
  ) {
    const off = await this.offService.createOff(admin, createOffDto);
    return await this.offService.buildOffResponse(off);
  }

  @Post('setAllCourses')
  @UseGuards(AdminAuthGuard)
  @UsePipes(new BackendValidationPipe())
  async setOffForAllCourses(
    @Body('') setDiscountOnAllDto: SetDiscountOnAllDto,
    @Admin() admin: AdminEntity,
  ) {
    await this.offService.setOffForAllCourses(setDiscountOnAllDto, admin);

    return {
      message: 'تخفیف روی تمامی دوره ها ثبت شد',
    };
  }

  @Post('setAllProducts')
  async setOff(
    @Body('') setDiscount: SetDiscountOnAllDto,
    @Admin() admin: AdminEntity,
  ) {
    await this.offService.setOffForAllProducts(setDiscount, admin);
    return {
      message: 'تخفیف روی تمامی محصولات ثبت شد',
    };
  }

  @Get('list')
  async findAllOffs(@Query() query: any): Promise<offsResponseInterface> {
    return await this.offService.findAllOffs(query);
  }

  @Get('product/:code')
  async OffUseUsesForProduct(
    @Param('code') code: string,
    @Body() getOneOffDto: GetOneOffDto,
  ) {
    const off = await this.offService.OffuseUsesForProduct(code, getOneOffDto);
    return await this.offService.buildOffResponse(off);
  }

  @Get('course/:code')
  async OffUseUsesForCourse(
    @Param('code') code: string,
    @Body() getOneOffDto: GetOneOffDto,
  ) {
    const off = await this.offService.OffuseUsesForCourse(code, getOneOffDto);
    return await this.offService.buildOffResponse(off);
  }

  @Get(':id')
  async getOneOff(@Param('id') id: number): Promise<OffResponseInterface> {
    const off = await this.offService.currentOff(id);
    return await this.offService.buildOffResponse(off);
  }

  @Put(':id')
  @UseGuards(AdminAuthGuard)
  @UsePipes(new BackendValidationPipe())
  async updateOneOffWithId(
    @Param('id') id: number,
    @Admin() admin: AdminEntity,
    @Body('') updateOffDto: UpdateOffDto,
  ): Promise<OffResponseInterface> {
    const off = await this.offService.updateOff(id, admin, updateOffDto);
    return await this.offService.buildOffResponse(off);
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  async deleteOneOff(
    @Param('id') id: number,
    @Admin() admin: AdminEntity,
  ): Promise<DeleteResult> {
    return await this.offService.deleteOneOffWithID(id, admin);
  }
}
