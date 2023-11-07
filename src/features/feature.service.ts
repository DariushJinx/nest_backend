import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { FeatureEntity } from './feature.entity';
import { ProductEntity } from '../product/product.entity';
import { CreateFeatureDto } from './dto/createFeature.dto';
import { FeatureResponseInterface } from './types/featureResponse.interface';
import { FeaturesResponseInterface } from './types/featuresResponse.interface';
import { UpdateFeatureDto } from './dto/updateFeature.dto';

@Injectable()
export class FeatureService {
  constructor(
    @InjectRepository(FeatureEntity)
    private readonly featureRepository: Repository<FeatureEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async createFeature(
    currentUser: UserEntity,
    createFeatureDto: CreateFeatureDto,
  ): Promise<FeatureEntity> {
    const feature = new FeatureEntity();
    Object.assign(feature, createFeatureDto);
    return await this.featureRepository.save(feature);
  }

  async getFeaturesByIds(ids: number[]): Promise<FeatureEntity[]> {
    return await this.featureRepository.findByIds(ids);
  }

  async getOneFeatureWithID(id: number): Promise<FeatureEntity> {
    return await this.featureRepository.findOne({
      where: { id: id },
    });
  }

  async buildFeatureResponse(
    feature: FeatureEntity,
  ): Promise<FeatureResponseInterface> {
    return { feature };
  }

  async deleteOneFeatureWithId(id: number): Promise<DeleteResult> {
    const feature = await this.getOneFeatureWithID(id);
    if (!feature) {
      throw new HttpException('ویژگی مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }
    return await this.featureRepository.delete({ id });
  }

  async findAllFeatures(): Promise<FeaturesResponseInterface> {
    const queryBuilder = this.featureRepository.createQueryBuilder('features');
    const featuresCount = await queryBuilder.getCount();
    const features = await queryBuilder.getMany();
    return { features, featuresCount };
  }

  async updateFeature(id: number, updateFeatureDto: UpdateFeatureDto) {
    const feature = await this.getOneFeatureWithID(id);

    if (!feature) {
      throw new HttpException('ویژگی مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }

    Object.assign(feature, updateFeatureDto);

    return await this.featureRepository.save(feature);
  }
}
