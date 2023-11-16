import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UserEntity } from '../user/user.entity';
import { CreateCommentDto } from './dto/createComment.dto';
import { CommentEntity } from './comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { CommentResponseInterface } from './types/commentResponse.interface';
import { CommentsResponseInterface } from './types/commentsResponse.interface';
import { UpdateCommentDto } from './dto/updateComment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createComment(
    currentUser: UserEntity,
    createCommentDto: CreateCommentDto,
  ): Promise<CommentEntity> {
    if (
      !createCommentDto.blog_id &&
      !createCommentDto.course_id &&
      !createCommentDto.product_id
    ) {
      throw new HttpException(
        'witch one of product_id and course_id and blog_id is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const comment = new CommentEntity();

    Object.assign(comment, createCommentDto);
    comment.user_id = currentUser;

    delete comment.user_id.password;

    return await this.commentRepository.save(comment);
  }

  async findAllComments(
    currentUser: number,
    query: any,
  ): Promise<CommentsResponseInterface> {
    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user_id', 'user_id');

    if (query.user_id) {
      const user_id = await this.userRepository.findOne({
        where: { username: query.user_id },
      });
      queryBuilder.andWhere('comment.user_id = :id', {
        id: user_id.id,
      });
    }

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    queryBuilder.orderBy('comment.createdAt', 'DESC');

    const commentsCount = await queryBuilder.getCount();
    const comments = await queryBuilder.getMany();
    return { comments, commentsCount };
  }

  async buildCommentResponse(
    comment: CommentEntity,
  ): Promise<CommentResponseInterface> {
    return { comment };
  }

  async currentComment(id: number): Promise<CommentEntity> {
    return await this.commentRepository.findOne({
      where: { id: id },
    });
  }

  async updateComment(
    id: number,
    currentUserID: number,
    updateCommentDto: UpdateCommentDto,
  ) {
    const comment = await this.currentComment(id);

    if (!comment) {
      throw new HttpException('comment does not exist', HttpStatus.NOT_FOUND);
    }

    if (comment.user_id.id !== currentUserID) {
      throw new HttpException('you are not an supplier', HttpStatus.FORBIDDEN);
    }

    Object.assign(comment, updateCommentDto);

    return await this.commentRepository.save(comment);
  }

  async deleteOneComment(id: number): Promise<DeleteResult> {
    const comment = await this.currentComment(id);
    if (!comment) {
      throw new HttpException('کامنت مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }
    if (comment.user_id.role !== 'ADMIN') {
      throw new HttpException(
        'شما مجاز به حذف کامنت نیستید',
        HttpStatus.FORBIDDEN,
      );
    }

    return await this.commentRepository.delete({ id });
  }

  async showComment(id: number) {
    const exsistComment = await this.currentComment(id);
    if (!exsistComment) {
      throw new HttpException('کامنت مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }
    if (exsistComment.user_id.role !== 'ADMIN') {
      throw new HttpException(
        'شما مجاز به نمایش کامنت نیستید',
        HttpStatus.FORBIDDEN,
      );
    }

    const comment = await this.commentRepository.update(
      { id: exsistComment.id },
      { show: 1 },
    );

    return comment;
  }

  async buildCommentResponses(comment: CommentEntity) {
    return {
      comment: {
        ...comment,
      },
    };
  }
}
