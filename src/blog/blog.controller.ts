import {
  Body,
  Controller,
  Post,
  UsePipes,
  UseInterceptors,
  UploadedFiles,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { User } from '../decorators/user.decorators';
import { UserEntity } from '../user/user.entity';
import { CreateBlogDto } from './dto/blog.dto';
import { BackendValidationPipe } from '../shared/pipes/backendValidation.pipe';
import { BlogResponseInterface } from './types/blogResponse.interface';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/category/middlewares/multer';
import { AuthGuard } from '../user/guard/auth.guard';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post('add')
//   @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  async createBlog(
    @User() currentUser: UserEntity,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createBlogDto: CreateBlogDto,
  ): Promise<BlogResponseInterface> {
    const blog = await this.blogService.createBlog(
      currentUser,
      createBlogDto,
      files,
    );
    return await this.blogService.buildBlogResponse(blog);
  }

  @Get('list')
  async findAllBlogs(@User() currentUser: number, @Query() query: any) {
    return await this.blogService.findAllBlogs(currentUser, query);
  }
}
