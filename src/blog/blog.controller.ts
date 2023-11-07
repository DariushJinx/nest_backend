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
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { User } from '../decorators/user.decorators';
import { UserEntity } from '../user/user.entity';
import { CreateBlogDto } from './dto/blog.dto';
import { BackendValidationPipe } from '../shared/pipes/backendValidation.pipe';
import { BlogResponseInterface } from './types/blogResponse.interface';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../category/middlewares/multer';
import { AuthGuard } from '../user/guard/auth.guard';
import { DeleteResult } from 'typeorm';
import { UpdateBlogDto } from './dto/updateBlog.dto';
import { BlogsResponseInterface } from './types/blogsResponse.interface';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post('add')
  @UseGuards(AuthGuard)
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
  async findAllBlogs(
    @User() currentUser: number,
    @Query() query: any,
  ): Promise<BlogsResponseInterface> {
    return await this.blogService.findAllBlogs(currentUser, query);
  }

  @Get(':slug')
  async getOneBlogWithSlug(
    @Param('slug') slug: string,
  ): Promise<BlogResponseInterface> {
    const blog = await this.blogService.getOneBlogWithSlug(slug);
    return await this.blogService.buildBlogResponse(blog);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  async deleteOneBlogWithSlug(
    @Param('slug') slug: string,
  ): Promise<DeleteResult> {
    return await this.blogService.deleteOneBlogWithSlug(slug);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async updateOneBlogWithId(
    @Param('id') id: number,
    @User('id') currentUserID: number,
    @Body('') updateBlogDto: UpdateBlogDto,
  ): Promise<BlogResponseInterface> {
    const blog = await this.blogService.updateBlog(
      id,
      currentUserID,
      updateBlogDto,
    );
    return await this.blogService.buildBlogResponse(blog);
  }

  @Put(':blogId/favorite')
  @UseGuards(AuthGuard)
  async InsertBlogToFavorite(
    @Param('blogId') blogId: number,
    @User('id') currentUser: number,
  ): Promise<BlogResponseInterface> {
    const blog = await this.blogService.favoriteBlog(blogId, currentUser);
    return await this.blogService.buildBlogResponse(blog);
  }

  @Delete(':blogId/favorite')
  @UseGuards(AuthGuard)
  async deleteBlogFromFavorite(
    @User('id') currentUser: number,
    @Param('blogId') blogId: number,
  ) {
    const blog = await this.blogService.deleteBlogFromFavorite(
      blogId,
      currentUser,
    );
    return await this.blogService.buildBlogResponse(blog);
  }
}
