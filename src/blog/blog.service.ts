import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from './blog.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { CreateBlogDto } from './dto/blog.dto';
import slugify from 'slugify';
import { BlogResponseInterface } from './types/blogResponse.interface';
import { FunctionUtils } from 'src/utils/functions.utils';
import { BlogsResponseInterface } from './types/blogsResponse.interface';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogEntity)
    private readonly blogRepository: Repository<BlogEntity>,
  ) {}

  async createBlog(
    currentUser: UserEntity,
    createBlogDto: CreateBlogDto,
    files: Express.Multer.File[],
  ): Promise<BlogEntity> {
    const blog = new BlogEntity();
    const images = FunctionUtils.ListOfImagesForRequest(
      files,
      createBlogDto.fileUploadPath,
    );
    Object.assign(blog, createBlogDto);
    blog.author = currentUser;
    blog.slug = this.getSlug(createBlogDto.title);
    return await this.blogRepository.save({
      ...blog,
      images,
      author: currentUser,
    });
  }

  async findAllBlogs(
    currentUser: number,
    query: any,
  ): Promise<BlogsResponseInterface> {
    const queryBuilder = this.blogRepository
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.author', 'author');

    const blogsCount = await queryBuilder.getCount();
    const blogs = await queryBuilder.getMany();
    return { blogs, blogsCount };
  }

  async buildBlogResponse(blog: BlogEntity): Promise<BlogResponseInterface> {
    return { blog };
  }

  private getSlug(title: string): string {
    return (
      slugify(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0)
    );
  }
}
