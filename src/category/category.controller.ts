import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { BackendValidationPipe } from 'src/shared/pipes/backendValidation.pipe';
import { CreateCategoryDto } from './dto/category.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from './middlewares/multer';
import { of } from 'rxjs';
import { join } from 'path';

@Controller()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('category/add')
  @UsePipes(new BackendValidationPipe())
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  async addCategory(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() categoryDto: CreateCategoryDto,
  ) {
    const category = await this.categoryService.addCategory(categoryDto, files);
    return this.categoryService.buildCategoryResponse(category);
  }

  @Get(':imageName')
  findImage(@Param('imageName') imageName: string, @Res() res) {
    return of(
      res.sendFile(join(process.cwd(), 'public', 'uploads', imageName)),
    );
  }
}
