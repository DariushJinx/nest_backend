import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OffController } from './off.controller';
import { OffService } from './off.service';
import { OffEntity } from './off.entity';
import { UserEntity } from 'src/user/user.entity';
import { ProductEntity } from 'src/product/product.entity';
import { CourseEntity } from 'src/course/course.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OffEntity,
      UserEntity,
      ProductEntity,
      CourseEntity,
    ]),
  ],
  controllers: [OffController],
  providers: [OffService],
})
export class OffModule {}
