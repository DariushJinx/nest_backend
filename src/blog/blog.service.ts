import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from './blog.entity';
import { DeleteResult, Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { CreateBlogDto } from './dto/blog.dto';
import slugify from 'slugify';
import { BlogResponseInterface } from './types/blogResponse.interface';
import { FunctionUtils } from '../utils/functions.utils';
import { BlogsResponseInterface } from './types/blogsResponse.interface';
import { UpdateBlogDto } from './dto/updateBlog.dto';
import { CommentEntity } from '../comment/comment.entity';
import { AdminEntity } from 'src/admin/admin.entity';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogEntity)
    private readonly blogRepository: Repository<BlogEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
  ) {}

  async createBlog(
    admin: AdminEntity,
    createBlogDto: CreateBlogDto,
    files: Express.Multer.File[],
  ): Promise<BlogEntity> {
    if (!admin) {
      throw new HttpException(
        'شما مجاز به ثبت مقاله نیستید',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const blog = new BlogEntity();
    const images = FunctionUtils.ListOfImagesForRequest(
      files,
      createBlogDto.fileUploadPath,
    );
    delete createBlogDto.fileUploadPath;
    delete createBlogDto.filename;
    Object.assign(blog, createBlogDto);
    blog.author = admin;
    delete blog.author.password;
    blog.images = images;
    delete blog.author.password;
    blog.slug = this.getSlug(createBlogDto.title);
    return await this.blogRepository.save({
      ...blog,
    });
  }

  async findAllBlogs(
    admin: AdminEntity,
    query: any,
  ): Promise<BlogsResponseInterface> {
    const queryBuilder = this.blogRepository
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.author', 'author');

    if (query.search) {
      queryBuilder.andWhere('blog.tags LIKE :search', {
        search: `%${query.search}`,
      });
    }

    if (query.tag) {
      queryBuilder.andWhere('blog.tags LIKE :tag', {
        tag: `%${query.tag}`,
      });
    }

    if (query.author) {
      const author = await this.adminRepository.findOne({
        where: { username: query.author },
      });
      if (!author) {
        throw new HttpException(
          'مقاله ای با این نویسنده یافت نشد',
          HttpStatus.NOT_FOUND,
        );
      }
      queryBuilder.andWhere('blog.authorId = :id', {
        id: author.id,
      });
    }

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    queryBuilder.orderBy('blog.createdAt', 'DESC');

    const blogsCount = await queryBuilder.getCount();
    const blogs = await queryBuilder.getMany();
    blogs.forEach((blog) => {
      delete blog.author.password;
    });
    return { blogs, blogsCount };
  }

  async findAllBlogsWithRating() {
    const blogs = await this.blogRepository.find();
    const comments = await this.commentRepository.find({
      where: { show: 1 },
    });

    const allBlogs = [];

    blogs.map(async (blog) => {
      let blogTotalScore: number = 5;
      const blogScores = comments?.filter((comment) => {
        if (comment.blog_id) {
          if (comment.blog_id.id.toString() === blog.id.toString()) {
            return comment;
          }
        }
      });

      blogScores.forEach((comment) => {
        blogTotalScore += Number(comment.score);
      });
      let average = ~~(blogTotalScore / (blogScores.length + 1));
      if (average < 0) {
        average = 0;
      } else if (average > 5) {
        average = 5;
      }
      allBlogs.push({
        ...blog,
        blogAverageScore: average,
      });

      blogs.forEach((blog) => {
        delete blog.author.password;
      });

      await this.blogRepository.save(allBlogs);
    });

    return allBlogs;
  }

  async getOneBlogWithSlug(slug: string): Promise<BlogEntity> {
    const blog = await this.blogRepository.findOne({
      where: { slug: slug },
      relations: ['comments'],
    });

    if (!blog) {
      throw new HttpException('blog does not exist', HttpStatus.NOT_FOUND);
    }

    delete blog.author.password;

    return blog;
  }

  async getOneBlogWithID(id: number): Promise<BlogEntity> {
    const blog = await this.blogRepository.findOne({
      where: { id: id },
    });

    if (!blog) {
      throw new HttpException('blog does not exist', HttpStatus.NOT_FOUND);
    }

    delete blog.author.password;

    return blog;
  }

  async deleteOneBlogWithSlug(
    slug: string,
    admin: AdminEntity,
  ): Promise<DeleteResult> {
    if (!admin) {
      throw new HttpException(
        'شما مجاز به حذف مقاله نیستید',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const blog = await this.getOneBlogWithSlug(slug);
    if (!blog) {
      throw new HttpException('مقاله مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }

    return await this.blogRepository.delete({ slug });
  }

  async updateBlog(
    id: number,
    admin: AdminEntity,
    updateBlogDto: UpdateBlogDto,
  ) {
    const blog = await this.getOneBlogWithID(id);

    if (!blog) {
      throw new HttpException('blog does not exist', HttpStatus.NOT_FOUND);
    }

    if (!admin) {
      throw new HttpException(
        'شما مجاز به به روز رسانی مقاله نیستید',
        HttpStatus.FORBIDDEN,
      );
    }

    Object.assign(blog, updateBlogDto);

    delete blog.author.password;

    return await this.blogRepository.save(blog);
  }

  async favoriteBlog(blogId: number, currentUser: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUser },
      relations: ['favorites'],
    });
    const blog = await this.getOneBlogWithID(blogId);

    const isNotFavorite =
      user.favorites.findIndex(
        (blogInFavorite) => blogInFavorite.id === blog.id,
      ) === -1;

    delete blog.author.password;

    if (isNotFavorite) {
      user.favorites.push(blog);
      blog.favoritesCount++;
      await this.userRepository.save(user);
      await this.blogRepository.save(blog);
    }

    return blog;
  }

  async deleteBlogFromFavorite(blogId: number, currentUser: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUser },
      relations: ['favorites'],
    });
    const blog = await this.getOneBlogWithID(blogId);

    const blogIndex = user.favorites.findIndex(
      (blogInFavorite) => blogInFavorite.id === blog.id,
    );

    if (blogIndex >= 0) {
      user.favorites.splice(blogIndex, 1);
      if (blog.favoritesCount < 0) {
        blog.favoritesCount = 0;
      }
      blog.favoritesCount--;
      await this.userRepository.save(user);
      await this.blogRepository.save(blog);
    }

    delete blog.author.password;

    return blog;
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
