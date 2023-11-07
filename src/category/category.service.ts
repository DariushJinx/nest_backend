import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { CategoryEntity } from './category.entity';
import { CreateCategoryDto } from './dto/category.dto';
import { CategoryResponseInterface } from './types/categoryResponse.interface';
import { FunctionUtils } from '../utils/functions.utils';
import { CategoriesResponseInterface } from './types/categoriesResponse.interface';

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

  async getListOfCategories(): Promise<CategoriesResponseInterface> {
    const queryBuilder =
      this.categoryRepository.createQueryBuilder('categories');

    const categoriesCount = await queryBuilder.getCount();
    const categories = await queryBuilder.getMany();
    return { categories, categoriesCount };
  }

  async getOneCategory(id: number) {
    return await this.categoryRepository.findOne({
      where: { id: id },
    });
  }

  async deleteCategory(id: number): Promise<DeleteResult> {
    const category = await this.getOneCategory(id);
    if (!category) {
      throw new HttpException(
        'دسته بندی مورد نظر یافت نشد',
        HttpStatus.NOT_FOUND,
      );
    }
    return await this.categoryRepository.delete({ id });
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
