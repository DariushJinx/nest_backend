import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UsePipes,
  Param,
  Delete,
  Put,
  Patch,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { AuthGuard } from 'src/user/guard/auth.guard';
import { BackendValidationPipe } from 'src/shared/pipes/backendValidation.pipe';
import { User } from 'src/decorators/user.decorators';
import { UserEntity } from 'src/user/user.entity';
import { CreateCommentDto } from './dto/createComment.dto';
import { CommentsResponseInterface } from './types/commentsResponse.interface';
import { CommentResponseInterface } from './types/commentResponse.interface';
import { UpdateCommentDto } from './dto/updateComment.dto';
import { DeleteResult } from 'typeorm';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('add')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async createCourse(
    @User() currentUser: UserEntity,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const comment = await this.commentService.createComment(
      currentUser,
      createCommentDto,
    );
    return await this.commentService.buildCommentResponse(comment);
  }

  @Get('list')
  async findAllComments(
    @User() currentUser: number,
    @Query() query: any,
  ): Promise<CommentsResponseInterface> {
    return await this.commentService.findAllComments(currentUser, query);
  }

  @Get(':id')
  async getOneComment(
    @Param('id') id: number,
  ): Promise<CommentResponseInterface> {
    const comment = await this.commentService.currentComment(id);
    return await this.commentService.buildCommentResponses(comment);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async updateOneCommentWithId(
    @Param('id') id: number,
    @User('id') currentUserID: number,
    @Body('') updateCommentDto: UpdateCommentDto,
  ): Promise<CommentResponseInterface> {
    const comment = await this.commentService.updateComment(
      id,
      currentUserID,
      updateCommentDto,
    );
    return await this.commentService.buildCommentResponse(comment);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async showComment(@Param('id') id: number) {
    const comment = await this.commentService.showComment(id);

    return comment;
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteOneProduct(@Param('id') id: number): Promise<DeleteResult> {
    return await this.commentService.deleteOneComment(id);
  }
}
