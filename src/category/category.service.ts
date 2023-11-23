import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from './category.entity';
import { CreateCategoryDto } from './dto/category.dto';
import { CategoryResponseInterface } from './types/categoryResponse.interface';
import { FunctionUtils } from '../utils/functions.utils';
import { CategoriesResponseInterface } from './types/categoriesResponse.interface';
import { AdminEntity } from '../admin/admin.entity';
import { UpdateCategoryDto } from './dto/updateCategory.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>,
  ) {}

  async addCategory(
    categoryDto: CreateCategoryDto,
    admin: AdminEntity,
    files: Express.Multer.File[],
  ): Promise<CategoryEntity> {
    const errorResponse = {
      errors: {},
    };

    const category = new CategoryEntity();

    const images = FunctionUtils.ListOfImagesForRequest(
      files,
      categoryDto.fileUploadPath,
    );

    delete categoryDto.fileUploadPath;
    delete categoryDto.filename;
    Object.assign(category, categoryDto);

    category.tree_comment = [];
    category.register = admin;
    delete category.register.password;
    category.images = images;

    const checkExistCategory = await this.categoryRepository.findOne({
      where: {
        title: category.title,
      },
    });

    if (checkExistCategory) {
      errorResponse.errors['category'] =
        'دسته بندی وارد شده از قبل موجود می باشد';
      throw new HttpException(errorResponse, HttpStatus.BAD_REQUEST);
    }
    const saveCategory = await this.categoryRepository.save(category);

    const categories = await this.categoryRepository.find();

    categories.forEach(async (comment: any) => {
      if (category.parent && category.parent !== 0) {
        let parentCode = category.parent.toString();
        category.tree_comment = [category.id.toString(), parentCode];
        let parent = categories.find(
          (item) => item.id.toString() === parentCode,
        );
        while (parent && parent.parent !== 0) {
          parentCode = parent.parent.toString();
          category.tree_comment.push(parentCode);
          parent = categories.find((item) => item.id.toString() === parentCode);
        }
      } else {
        category.tree_comment = [category.id.toString()];
      }
      await this.categoryRepository.update(
        { id: comment.id },
        { tree_comment: comment.tree_comment },
      );
      await this.categoryRepository.save(saveCategory);
    });

    return saveCategory;
  }

  async getListOfCategories(query: any): Promise<CategoriesResponseInterface> {
    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.register', 'register');

    if (query.register) {
      const register = await this.adminRepository.findOne({
        where: { username: query.register },
      });
      if (!register) {
        throw new HttpException(
          'دسته بندی ای با این نویسنده یافت نشد',
          HttpStatus.NOT_FOUND,
        );
      }
      queryBuilder.andWhere('category.registerId = :id', {
        id: register.id,
      });
    }

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    queryBuilder.orderBy('category.createdAt', 'DESC');

    const categoriesCount = await queryBuilder.getCount();
    const allCategories = await queryBuilder.getMany();

    if (!allCategories.length) {
      throw new HttpException('مقاله ای یافت نشد', HttpStatus.NOT_FOUND);
    }

    allCategories.forEach((category) => {
      delete category.register.password;
    });
    return { allCategories, categoriesCount };
  }

  async getOneCategory(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { id: id },
    });

    if (!category) {
      throw new HttpException(
        'دسته بندی مورد نظر یافت نشد',
        HttpStatus.NOT_FOUND,
      );
    }

    delete category.register.password;

    return category;
  }

  async deleteCategory(
    id: number,
    admin: AdminEntity,
  ): Promise<{ message: string }> {
    await this.getOneCategory(id);

    if (!admin) {
      throw new HttpException(
        'شما مجاز به حذف دسته بندی نیستید',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.categoryRepository.delete({ id });

    return {
      message: 'دسته بندی مورد نظر با موفقیت حذف گردید',
    };
  }

  async updateCategory(
    id: number,
    admin: AdminEntity,
    updateCategoryDto: UpdateCategoryDto,
  ) {
    const errorResponse = {
      errors: {},
    };

    const category = await this.getOneCategory(id);

    if (!admin) {
      errorResponse.errors['admin'] =
        'شما مجاز به به روز رسانی دسته بندی نیستید';
      errorResponse.errors['statusCode'] = HttpStatus.FORBIDDEN;
      throw new HttpException(errorResponse, HttpStatus.FORBIDDEN);
    }

    Object.assign(category, updateCategoryDto);

    delete category.register.password;

    return await this.categoryRepository.save(category);
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
