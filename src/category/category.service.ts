import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from './category.entity';
import { CreateCategoryDto } from './dto/category.dto';
import { CategoryResponseInterface } from './types/categoryResponse.interface';
import { FunctionUtils } from 'src/utils/functions.utils';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async addCategory(
    categoryDto: CreateCategoryDto,
    files: Express.Multer.File[],
  ): Promise<CategoryEntity> {
    const errorResponse = {
      errors: {},
    };

    const category = await this.categoryRepository.findOne({
      select: {
        title: true,
      },
      where: {
        title: categoryDto.title,
      },
    });

    const images = FunctionUtils.ListOfImagesForRequest(
      files,
      categoryDto.fileUploadPath,
    );

    if (category) {
      errorResponse.errors['category'] =
        'دسته بندی وارد شده از قبل موجود می باشد';
      throw new HttpException(errorResponse, HttpStatus.BAD_REQUEST);
    }

    return await this.categoryRepository.save({
      title: categoryDto.title,
      images,
    });
  }

  async buildCategoryResponse(
    category: CategoryEntity,
  ): Promise<CategoryResponseInterface> {
    return {
      category: {
        ...category,
      },
    };
  }
}
