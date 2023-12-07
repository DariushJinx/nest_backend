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
import { AdminAuthGuard } from '../admin/guard/adminAuth.guard';
import { Admin } from 'src/decorators/admin.decorators';
import { AdminEntity } from 'src/admin/admin.entity';
import { AuthBothGuard } from 'src/user/guard/bothAuth.guard';

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
    @User() currentUser: UserEntity,
    @Query() query: any,
  ): Promise<CommentsResponseInterface> {
    return await this.commentService.findAllComments(currentUser, query);
  }

  @Get('tree_comment')
  @UseGuards(AdminAuthGuard)
  async reIndexTreeComment(@Admin() admin: AdminEntity) {
    return await this.commentService.reIndexTreeComment(admin);
  }

  @Get('parents')
  async getParents() {
    return await this.commentService.getParents();
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
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<CommentResponseInterface> {
    const comment = await this.commentService.updateComment(
      id,
      currentUserID,
      updateCommentDto,
    );
    return await this.commentService.buildCommentResponse(comment);
  }

  @Patch(':id')
  @UseGuards(AdminAuthGuard)
  @UsePipes(new BackendValidationPipe())
  async showComment(@Param('id') id: number, @Admin() admin: AdminEntity) {
    const comment = await this.commentService.showComment(id, admin);

    return comment;
  }

  @Delete(':id')
  @UseGuards(AuthBothGuard)
  async deleteOneProduct(
    @Param('id') id: number,
    @User() user: UserEntity,
    @Admin() admin: AdminEntity,
  ): Promise<{
    message: string;
  }> {
    await this.commentService.deleteOneComment(id, user, admin);

    return {
      message: 'کامنت مورد نظر با موفقیت حذف شد',
    };
  }
}
