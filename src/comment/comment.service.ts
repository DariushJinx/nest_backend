import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UserEntity } from '../user/user.entity';
import { CreateCommentDto } from './dto/createComment.dto';
import { CommentEntity } from './comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { CommentResponseInterface } from './types/commentResponse.interface';
import { CommentsResponseInterface } from './types/commentsResponse.interface';

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
    const newComment = new CommentEntity();

    Object.assign(newComment, createCommentDto);

    newComment.user_id = currentUser;
    newComment.tree_comment = [];

    delete newComment.user_id.password;

    const saveComment = await this.commentRepository.save(newComment);

    const comments = await this.commentRepository.find();

    comments.forEach(async (comment: any) => {
      if (newComment.parent && newComment.parent !== 0) {
        let parentCode = newComment.parent.toString();
        newComment.tree_comment = [newComment.id.toString(), parentCode];
        let parent = comments.find((item) => item.id.toString() === parentCode);
        while (parent && parent.parent !== 0) {
          parentCode = parent.parent.toString();
          newComment.tree_comment.push(parentCode);
          parent = comments.find((item) => item.id.toString() === parentCode);
        }
      } else {
        newComment.tree_comment = [newComment.id.toString()];
      }
      await this.commentRepository.update(
        { id: comment.id },
        { tree_comment: comment.tree_comment },
      );
      await this.commentRepository.save(saveComment);
    });

    return saveComment;
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

  async reIndexTreeComment(currentUser: number) {
    const queryBuilder = this.commentRepository.createQueryBuilder('comment');

    queryBuilder.orderBy('comment.id', 'DESC');

    const comments = await queryBuilder.getMany();

    comments.forEach(async (item) => {
      item.tree_comment = [];

      if (item.parent && item.parent !== 0) {
        let parentId = item.parent.toString();
        const commentId = item.id.toString();
        item.tree_comment = [commentId, parentId];
        let parent = comments.find((li) => li.id.toString() === parentId);
        while (parent && parent.parent !== 0) {
          parentId = parent.parent.toString();
          item.tree_comment.push(parentId);
          parent = comments.find((li) => li.id.toString() === parentId);
        }
      } else {
        item.tree_comment = [item.id.toString()];
      }
    });
    comments.forEach(async (item) => {
      await this.commentRepository.update(
        { id: item.id },
        {
          tree_comment: item.tree_comment,
        },
      );
    });

    return comments;
  }

  async getParents(currentUser: number) {
    let comments: any;
    await this.commentRepository
      .find({
        where: { parent: 0 },
      })
      .then((data) => {
        return data.sort((a: any, b: any) => a.id - b.id);
      })
      .then((finalData) => {
        comments = finalData;
      });

    return comments;
  }

  async currentComment(id: number): Promise<CommentEntity> {
    return await this.commentRepository.findOne({
      where: { id: id },
    });
  }

  async updateComment(
    id: number,
    currentUserID: number,
    commentCheck: string,
    score: number,
  ) {
    const comment = await this.currentComment(id);

    if (!comment) {
      throw new HttpException('comment does not exist', HttpStatus.NOT_FOUND);
    }

    if (comment.user_id.id !== currentUserID) {
      throw new HttpException('you are not an supplier', HttpStatus.FORBIDDEN);
    }

    Object.assign(comment, { commentCheck, score });

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

  async buildCommentResponse(
    comment: CommentEntity,
  ): Promise<CommentResponseInterface> {
    return { comment };
  }

  async buildCommentResponses(comment: CommentEntity) {
    return {
      comment: {
        ...comment,
      },
    };
  }
}
