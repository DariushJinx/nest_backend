import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
  Get,
  Delete,
  Param,
  UseGuards,
  Query,
  Put,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { BackendValidationPipe } from '../shared/pipes/backendValidation.pipe';
import { CreateCategoryDto } from './dto/category.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from './middlewares/multer';
import { CategoriesResponseInterface } from './types/categoriesResponse.interface';
import { AdminAuthGuard } from '../admin/guard/adminAuth.guard';
import { Admin } from '../decorators/admin.decorators';
import { AdminEntity } from '../admin/admin.entity';
import { CategoryResponseInterface } from './types/categoryResponse.interface';
import { UpdateCategoryDto } from './dto/updateCategory.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('add')
  @UsePipes(new BackendValidationPipe())
  @UseGuards(AdminAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  async addCategory(
    @Admin() admin: AdminEntity,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() categoryDto: CreateCategoryDto,
  ) {
    const category = await this.categoryService.addCategory(
      categoryDto,
      admin,
      files,
    );
    return this.categoryService.buildCategoryResponse(category);
  }

  @Get('list')
  async getListOfCategories(
    @Query() query: any,
  ): Promise<CategoriesResponseInterface> {
    return this.categoryService.getListOfCategories(query);
  }

  @Get(':id')
  async getOneCategoryWithID(
    @Param('id') id: number,
  ): Promise<CategoryResponseInterface> {
    const blog = await this.categoryService.getOneCategory(id);
    return await this.categoryService.buildCategoryResponse(blog);
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  async deleteCategoryWithId(
    @Param('id') id: number,
    @Admin() admin: AdminEntity,
  ): Promise<{ message: string }> {
    return await this.categoryService.deleteCategory(id, admin);
  }

  @Put(':id')
  @UseGuards(AdminAuthGuard)
  @UsePipes(new BackendValidationPipe())
  async updateOneCategoryWithId(
    @Param('id') id: number,
    @Admin() admin: AdminEntity,
    @Body('') updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseInterface> {
    const category = await this.categoryService.updateCategory(
      id,
      admin,
      updateCategoryDto,
    );
    return await this.categoryService.buildCategoryResponse(category);
  }
}
