import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
  Put,
} from '@nestjs/common';
import { FeatureService } from './feature.service';
import { AuthGuard } from '../user/guard/auth.guard';
import { BackendValidationPipe } from '../shared/pipes/backendValidation.pipe';
import { User } from '../decorators/user.decorators';
import { UserEntity } from '../user/user.entity';
import { CreateFeatureDto } from './dto/createFeature.dto';
import { FeatureResponseInterface } from './types/featureResponse.interface';
import { DeleteResult } from 'typeorm';
import { FeaturesResponseInterface } from './types/featuresResponse.interface';
import { UpdateFeatureDto } from './dto/updateFeature.dto';

@Controller('feature')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Post('add')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async createFeature(
    @User() currentUser: UserEntity,
    @Body() createFeatureDto: CreateFeatureDto,
  ) {
    const feature = await this.featureService.createFeature(
      currentUser,
      createFeatureDto,
    );
    return await this.featureService.buildFeatureResponse(feature);
  }

  @Get('list')
  @UseGuards(AuthGuard)
  async findAllFeatures(): Promise<FeaturesResponseInterface> {
    return await this.featureService.findAllFeatures();
  }

  @Get(':id')
  async getOneFeature(
    @Param('id') id: number,
  ): Promise<FeatureResponseInterface> {
    const feature = await this.featureService.getOneFeatureWithID(id);
    return await this.featureService.buildFeatureResponse(feature);
  }

  @Get('/features/:ids')
  async getFeaturesByIds(@Param('ids') ids: string) {
    const featureIds = ids.split(',').map((id) => parseInt(id, 10));
    const features = await this.featureService.getFeaturesByIds(featureIds);
    return { message: 'Features retrieved', features };
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteOneFeature(@Param('id') id: number): Promise<DeleteResult> {
    return await this.featureService.deleteOneFeatureWithId(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async updateOneBlogWithId(
    @Param('id') id: number,
    @Body('') updateFeatureDto: UpdateFeatureDto,
  ): Promise<FeatureResponseInterface> {
    const feature = await this.featureService.updateFeature(
      id,
      updateFeatureDto,
    );
    return await this.featureService.buildFeatureResponse(feature);
  }
}
