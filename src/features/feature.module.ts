import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureEntity } from './feature.entity';
import { FeatureController } from './feature.controller';
import { UserEntity } from 'src/user/user.entity';
import { FeatureService } from './feature.service';
import { ProductEntity } from 'src/product/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FeatureEntity, UserEntity, ProductEntity]),
  ],
  controllers: [FeatureController],
  providers: [FeatureService],
})
export class FeatureModule {}
