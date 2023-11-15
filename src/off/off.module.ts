import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OffController } from './off.controller';
import { OffService } from './off.service';
import { OffEntity } from './off.entity';
import { UserEntity } from 'src/user/user.entity';
import { ProductEntity } from 'src/product/product.entity';
import { CourseEntity_2 } from 'src/course_2/course_2.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      UserEntity,
      CourseEntity_2,
      OffEntity,
    ]),
  ],
  controllers: [OffController],
  providers: [OffService],
})
export class OffModule {}
