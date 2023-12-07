import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from 'src/product/product.entity';
import { Repository } from 'typeorm';
import { OffEntity } from './off.entity';
import { CreateOffDto } from './dto/createOff.dto';
import { OffResponseInterface } from './types/offResponse.interface';
import { offsResponseInterface } from './types/offsResponse.interface';
import { CourseEntity_2 } from 'src/course_2/course_2.entity';
import { UpdateOffDto } from './dto/updateOff.dto';
import { GetOneOffDto } from './dto/getOneOff.dto';
import { SetDiscountOnAllDto } from './dto/setOffAll.dto';
import { AdminEntity } from 'src/admin/admin.entity';

@Injectable()
export class OffService {
  constructor(
    @InjectRepository(OffEntity)
    private readonly offRepository: Repository<OffEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>,
    @InjectRepository(CourseEntity_2)
    private readonly courseRepository: Repository<CourseEntity_2>,
  ) {}

  async createOff(
    admin: AdminEntity,
    createOffDto: CreateOffDto,
  ): Promise<OffEntity> {
    const off = new OffEntity();

    Object.assign(off, createOffDto);
    off.creator = admin;
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

  async findAllOffs(query: any): Promise<offsResponseInterface> {
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
      const creator = await this.adminRepository.findOne({
        where: { username: query.username },
      });

      if (!creator) {
        throw new HttpException(
          'سازنده تخفیف وجود ندارد',
          HttpStatus.UNAUTHORIZED,
        );
      }

      queryBuilder.andWhere('off.creator = :id', {
        id: creator.id,
      });
    }

    queryBuilder.orderBy('off.createdAt', 'DESC');

    const offsCount = await queryBuilder.getCount();
    const offs = await queryBuilder.getMany();
    offs.forEach((off) => {
      delete off.creator.id;
      delete off.creator.first_name;
      delete off.creator.last_name;
      delete off.creator.mobile;
      delete off.creator.isBan;
      delete off.creator.email;
      delete off.creator.password;
    });
    return { offs, offsCount };
  }

  async OffuseUsesForProduct(code: string, getOneOffDto: GetOneOffDto) {
    const errorResponse = {
      errors: {},
    };

    const offForProduct = await this.offRepository.findOne({
      where: { code: code, product_id: getOneOffDto.product_id },
    });

    if (!offForProduct) {
      errorResponse.errors['off_product'] =
        'تخفیفی برای محصول مورد نظر یافت نشد';
      errorResponse.errors['statusCode'] = HttpStatus.NOT_FOUND;
      throw new HttpException(errorResponse, HttpStatus.NOT_FOUND);
    } else if (offForProduct.max === offForProduct.uses) {
      errorResponse.errors['off'] =
        'محدودیت استفاده از کد تخفیف به اتمام رسیده است';
      errorResponse.errors['statusCode'] = HttpStatus.CONFLICT;
      throw new HttpException(errorResponse, HttpStatus.CONFLICT);
    } else if (offForProduct) {
      await this.offRepository.update(
        { code: offForProduct.code },
        { uses: offForProduct.uses + 1 },
      );
    }
    delete offForProduct.creator.id;
    delete offForProduct.creator.first_name;
    delete offForProduct.creator.last_name;
    delete offForProduct.creator.mobile;
    delete offForProduct.creator.isBan;
    delete offForProduct.creator.email;
    delete offForProduct.creator.password;
    return offForProduct;
  }

  async OffuseUsesForCourse(code: string, getOneOffDto: GetOneOffDto) {
    const errorResponse = {
      errors: {},
    };

    const offForCourse = await this.offRepository.findOne({
      where: { code: code, course_id: getOneOffDto.course_id },
    });

    if (!offForCourse) {
      errorResponse.errors['off_course'] = 'تخفیفی برای دوره مورد نظر یافت نشد';
      errorResponse.errors['statusCode'] = HttpStatus.NOT_FOUND;
      throw new HttpException(errorResponse, HttpStatus.NOT_FOUND);
    } else if (offForCourse.max === offForCourse.uses) {
      errorResponse.errors['off'] =
        'محدودیت استفاده از کد تخفیف به اتمام رسیده است';
      errorResponse.errors['statusCode'] = HttpStatus.CONFLICT;
      throw new HttpException(errorResponse, HttpStatus.CONFLICT);
    } else if (offForCourse) {
      await this.offRepository.update(
        { code: offForCourse.code },
        { uses: offForCourse.uses + 1 },
      );
    }

    delete offForCourse.creator.id;
    delete offForCourse.creator.first_name;
    delete offForCourse.creator.last_name;
    delete offForCourse.creator.mobile;
    delete offForCourse.creator.isBan;
    delete offForCourse.creator.email;
    delete offForCourse.creator.password;
    return offForCourse;
  }

  async currentOff(id: number) {
    const off = await this.offRepository.findOne({
      where: { id: id },
    });
    if (!off) {
      throw new HttpException('تخفیفی وجود ندارد', HttpStatus.NOT_FOUND);
    }
    delete off.creator.id;
    delete off.creator.first_name;
    delete off.creator.last_name;
    delete off.creator.mobile;
    delete off.creator.isBan;
    delete off.creator.email;
    delete off.creator.password;
    return off;
  }

  async updateOff(id: number, admin: AdminEntity, updateOffDto: UpdateOffDto) {
    const errorResponse = {
      errors: {},
    };

    const off = await this.currentOff(id);

    if (!off) {
      errorResponse.errors['off'] = 'تخفیفی یافت نشد';
      errorResponse.errors['statusCode'] = HttpStatus.NOT_FOUND;
      throw new HttpException(errorResponse, HttpStatus.NOT_FOUND);
    }

    if (!admin) {
      errorResponse.errors['off'] = 'شما مجاز به تغییر تخفیف نیستید';
      errorResponse.errors['statusCode'] = HttpStatus.FORBIDDEN;
      throw new HttpException(errorResponse, HttpStatus.FORBIDDEN);
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

  async setOffForAllCourses(
    setDiscountOnAllDto: SetDiscountOnAllDto,
    admin: AdminEntity,
  ) {
    const errorResponse = {
      errors: {},
    };

    if (!admin) {
      errorResponse.errors['off'] = 'شما مجاز به تغییر تخفیف نیستید';
      errorResponse.errors['statusCode'] = HttpStatus.FORBIDDEN;
      throw new HttpException(errorResponse, HttpStatus.FORBIDDEN);
    }

    const courses = await this.courseRepository.find();

    courses.forEach((course) => {
      course.discount = setDiscountOnAllDto.discount;
    });

    await this.courseRepository.save(courses);
  }

  async setOffForAllProducts(
    setDiscount: SetDiscountOnAllDto,
    admin: AdminEntity,
  ) {
    const errorResponse = {
      errors: {},
    };

    if (!admin) {
      errorResponse.errors['off'] = 'شما مجاز به تغییر تخفیف نیستید';
      errorResponse.errors['statusCode'] = HttpStatus.FORBIDDEN;
      throw new HttpException(errorResponse, HttpStatus.FORBIDDEN);
    }

    const products = await this.productRepository.find();

    products.forEach((product) => {
      product.discount = setDiscount.discount;
    });

    await this.productRepository.save(products);
  }

  async deleteOneOffWithID(
    id: number,
    admin: AdminEntity,
  ): Promise<{
    message: string;
  }> {
    const off = await this.currentOff(id);

    if (!off) {
      throw new HttpException('تخفیف مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }
    if (!admin) {
      throw new HttpException(
        'شما مجاز به حذف تخفیف نیستید',
        HttpStatus.FORBIDDEN,
      );
    }

    if (off.product_id) {
      await this.productRepository.update(
        { id: off.product_id },
        { discount: 0 },
      );
    } else if (off.course_id) {
      await this.courseRepository.update(
        { id: off.course_id },
        { discount: 0 },
      );
    }

    await this.offRepository.delete({ id });

    return {
      message: 'تخفیف مورد نظر با موفقیت حذف شد',
    };
  }

  async buildOffResponse(off: OffEntity): Promise<OffResponseInterface> {
    return { off };
  }
}
