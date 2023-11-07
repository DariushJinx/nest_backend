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
  Res,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { BackendValidationPipe } from '../shared/pipes/backendValidation.pipe';
import { CreateCategoryDto } from './dto/category.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from './middlewares/multer';
import { of } from 'rxjs';
import { join } from 'path';
import { CategoriesResponseInterface } from './types/categoriesResponse.interface';
import { DeleteResult } from 'typeorm';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('add')
  @UsePipes(new BackendValidationPipe())
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  async addCategory(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() categoryDto: CreateCategoryDto,
  ) {
    const category = await this.categoryService.addCategory(categoryDto, files);
    return this.categoryService.buildCategoryResponse(category);
  }

  @Get('list')
  async getListOfCategories(): Promise<CategoriesResponseInterface> {
    return this.categoryService.getListOfCategories();
  }

  @Delete(':id')
  async deleteCategoryWithId(@Param('id') id: number): Promise<DeleteResult> {
    return await this.categoryService.deleteCategory(id);
  }

  @Get(':imageName')
  findImage(@Param('imageName') imageName: string, @Res() res) {
    return of(
      res.sendFile(join(process.cwd(), 'public', 'uploads', imageName)),
    );
  }
}
