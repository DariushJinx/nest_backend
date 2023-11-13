import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  Get,
  Query,
} from '@nestjs/common';
import { AuthGuard } from 'src/user/guard/auth.guard';
import { BackendValidationPipe } from 'src/shared/pipes/backendValidation.pipe';
import { User } from 'src/decorators/user.decorators';
import { UserEntity } from 'src/user/user.entity';
import { CreateOffDto } from './dto/createOff.dto';
import { OffService } from './off.service';
import { offsResponseInterface } from './types/offsResponse.interface';

@Controller('off')
export class OffController {
  constructor(private readonly offService: OffService) {}

  @Post('add/product')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async createEpisode(
    @User() user: UserEntity,
    @Body() createOffDto: CreateOffDto,
  ) {
    const off = await this.offService.createOff(user, createOffDto);
    return await this.offService.buildOffResponse(off);
  }

  @Get('list')
  async findAllOffs(
    @User() currentUser: number,
    @Query() query: any,
  ): Promise<offsResponseInterface> {
    return await this.offService.findAllOffs(currentUser, query);
  }
}
