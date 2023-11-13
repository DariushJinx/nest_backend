import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseEntity } from 'src/course/course.entity';
import { ProductEntity } from 'src/product/product.entity';
import { UserEntity } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { OffEntity } from './off.entity';
import { CreateOffDto } from './dto/createOff.dto';
import { OffResponseInterface } from './types/offResponse.interface';
import { offsResponseInterface } from './types/offsResponse.interface';

@Injectable()
export class OffService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
    @InjectRepository(OffEntity)
    private readonly offRepository: Repository<OffEntity>,
  ) {}

  async createOff(
    currentUser: UserEntity,
    createOffDto: CreateOffDto,
  ): Promise<OffEntity> {
    const off = new OffEntity();

    Object.assign(off, createOffDto);
    off.creator = currentUser;
    off.course_id = createOffDto.course_id;
    off.product_id = createOffDto.product_id;
    off.uses = '0';
    delete off.creator.password;

    const offResult = await this.offRepository.save(off);

    if (createOffDto.product_id) {
      await this.productRepository.update(
        { id: offResult.product_id },
        { discount: offResult.percent },
      );
    } else if (createOffDto.course_id) {
      await this.courseRepository.update(
        { id: offResult.course_id },
        { discount: offResult.percent },
      );
    }
    return offResult;
  }

  async findAllOffs(
    currentUser: number,
    query: any,
  ): Promise<offsResponseInterface> {
    const queryBuilder = this.offRepository
      .createQueryBuilder('off')
      .leftJoinAndSelect('off.creator', 'creator');

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    if (query.username) {
      const creator = await this.userRepository.findOne({
        where: { username: query.username },
      });
      queryBuilder.andWhere('off.creator = :id', {
        id: creator.id,
      });
    }

    queryBuilder.orderBy('off.createdAt', 'DESC');

    const offsCount = await queryBuilder.getCount();
    const offs = await queryBuilder.getMany();
    return { offs, offsCount };
  }

  async buildOffResponse(off: OffEntity): Promise<OffResponseInterface> {
    return { off };
  }
}
