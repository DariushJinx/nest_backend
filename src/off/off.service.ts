import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from 'src/product/product.entity';
import { UserEntity } from 'src/user/user.entity';
import { DeleteResult, Repository } from 'typeorm';
import { OffEntity } from './off.entity';
import { CreateOffDto } from './dto/createOff.dto';
import { OffResponseInterface } from './types/offResponse.interface';
import { offsResponseInterface } from './types/offsResponse.interface';
import { CourseEntity_2 } from 'src/course_2/course_2.entity';
import { UpdateOffDto } from './dto/updateOff.dto';
import { GetOneOffDto } from './dto/getOneOff.dto';
import { SetDiscountOnAllDto } from './dto/setOffAll.dto';

@Injectable()
export class OffService {
  constructor(
    @InjectRepository(OffEntity)
    private readonly offRepository: Repository<OffEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CourseEntity_2)
    private readonly courseRepository: Repository<CourseEntity_2>,
  ) {}

  async createOff(
    currentUser: UserEntity,
    createOffDto: CreateOffDto,
  ): Promise<OffEntity> {
    const off = new OffEntity();

    Object.assign(off, createOffDto);
    off.creator = currentUser;
    off.uses = 0;
    off.max = +createOffDto.max;
    delete off.creator.password;

    const offResult = await this.offRepository.save(off);

    if (createOffDto.product_id && !createOffDto.course_id) {
      await this.productRepository.update(
        { id: offResult.product_id },
        { discount: offResult.percent },
      );
    } else if (createOffDto.course_id && !createOffDto.product_id) {
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

  async OffuseUsesForProduct(code: string, getOneOffDto: GetOneOffDto) {
    const offForProduct = await this.offRepository.findOne({
      where: { code: code, product_id: getOneOffDto.product_id },
    });

    if (!offForProduct) {
      throw new HttpException(
        'any off for product dose not exist',
        HttpStatus.NOT_FOUND,
      );
    } else if (offForProduct.max === offForProduct.uses) {
      throw new HttpException(
        'The limit of use of the desired code is over',
        HttpStatus.CONFLICT,
      );
    } else if (offForProduct) {
      await this.offRepository.update(
        { code: offForProduct.code },
        { uses: offForProduct.uses + 1 },
      );
    }
    return offForProduct;
  }

  async OffuseUsesForCourse(code: string, getOneOffDto: GetOneOffDto) {
    const offForCourse = await this.offRepository.findOne({
      where: { code: code, course_id: getOneOffDto.course_id },
    });

    if (!offForCourse) {
      throw new HttpException(
        'any off for course dose not exist',
        HttpStatus.NOT_FOUND,
      );
    } else if (offForCourse.max === offForCourse.uses) {
      throw new HttpException(
        'The limit of use of the desired code is over',
        HttpStatus.CONFLICT,
      );
    } else if (offForCourse) {
      await this.offRepository.update(
        { code: offForCourse.code },
        { uses: offForCourse.uses + 1 },
      );
    }

    return offForCourse;
  }

  async currentOff(id: number) {
    const off = await this.offRepository.findOne({
      where: { id: id },
    });
    if (!off) {
      throw new HttpException('any off dose not exist', HttpStatus.NOT_FOUND);
    }
    return off;
  }

  async updateOff(
    id: number,
    currentUserID: number,
    updateOffDto: UpdateOffDto,
  ) {
    const off = await this.currentOff(id);

    if (!off) {
      throw new HttpException('off does not exist', HttpStatus.NOT_FOUND);
    }

    if (off.creator.id !== currentUserID) {
      throw new HttpException(
        'شما مجاز به تغییر تخفیف نیستید',
        HttpStatus.FORBIDDEN,
      );
    }

    Object.assign(off, updateOffDto);

    const offResult = await this.offRepository.save(off);

    if (updateOffDto.product_id) {
      await this.productRepository.update(
        { id: offResult.product_id },
        { discount: offResult.percent },
      );
    } else if (updateOffDto.course_id) {
      await this.courseRepository.update(
        { id: offResult.course_id },
        { discount: offResult.percent },
      );
    }

    return offResult;
  }

  async setOffForAllCourses(setDiscountOnAllDto: SetDiscountOnAllDto) {
    const courses = await this.courseRepository.find();

    courses.forEach((course) => {
      course.discount = setDiscountOnAllDto.discount;
    });

    await this.courseRepository.save(courses);
  }

  async setOffForAllProducts(setDiscount: SetDiscountOnAllDto) {
    const products = await this.productRepository.find();

    products.forEach((product) => {
      product.discount = setDiscount.discount;
    });

    await this.productRepository.save(products);
  }

  async deleteOneOffWithID(
    id: number,
    user: UserEntity,
  ): Promise<DeleteResult> {
    const off = await this.currentOff(id);
    const userResult = await this.userRepository.findOne({
      where: { id: off.creator.id },
    });

    if (!off) {
      throw new HttpException('تخفیف مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }
    if (userResult.id !== user.id) {
      throw new HttpException(
        'شما مجاز به حذف تخفیف نیستید',
        HttpStatus.FORBIDDEN,
      );
    }

    return await this.offRepository.delete({ id });
  }

  async buildOffResponse(off: OffEntity): Promise<OffResponseInterface> {
    return { off };
  }
}
