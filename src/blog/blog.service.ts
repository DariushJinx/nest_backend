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

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogEntity)
    private readonly blogRepository: Repository<BlogEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
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
    delete createBlogDto.fileUploadPath;
    delete createBlogDto.filename;
    Object.assign(blog, createBlogDto);
    blog.author = currentUser;
    delete blog.author.password;
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
      const author = await this.userRepository.findOne({
        where: { username: query.author },
      });
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
    return { blogs, blogsCount };
  }

  async findAllBlogsWithRating(user: UserEntity) {
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
      await this.blogRepository.save(allBlogs);
    });

    return allBlogs;
  }

  async getOneBlogWithSlug(slug: string): Promise<BlogEntity> {
    return await this.blogRepository.findOne({
      where: { slug: slug },
      relations: ['comments'],
    });
  }

  async getOneBlogWithID(id: number): Promise<BlogEntity> {
    return await this.blogRepository.findOne({
      where: { id: id },
    });
  }

  async deleteOneBlogWithSlug(slug: string): Promise<DeleteResult> {
    const blog = await this.getOneBlogWithSlug(slug);
    if (!blog) {
      throw new HttpException('مقاله مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }
    if (blog.author.role !== 'ADMIN') {
      throw new HttpException(
        'شما مجاز به حذف مقاله نیستید',
        HttpStatus.FORBIDDEN,
      );
    }

    return await this.blogRepository.delete({ slug });
  }

  async updateBlog(
    id: number,
    currentUserID: number,
    updateBlogDto: UpdateBlogDto,
  ) {
    const blog = await this.getOneBlogWithID(id);

    if (!blog) {
      throw new HttpException('blog does not exist', HttpStatus.NOT_FOUND);
    }

    if (blog.author.id !== currentUserID) {
      throw new HttpException('you are not an author', HttpStatus.FORBIDDEN);
    }

    Object.assign(blog, updateBlogDto);

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
