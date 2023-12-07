import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { AuthGuard } from 'src/user/guard/auth.guard';
import { BackendValidationPipe } from 'src/shared/pipes/backendValidation.pipe';
import { User } from 'src/decorators/user.decorators';
import { UserEntity } from 'src/user/user.entity';
import { CreateContactDto } from './dto/createContact.dto';
import { ContactsResponseInterface } from './types/contactsResponse.interface';
import { CreateAnswerDto } from './dto/createAnswer.dto';
import { AdminAuthGuard } from 'src/admin/guard/adminAuth.guard';
import { Admin } from 'src/decorators/admin.decorators';
import { AdminEntity } from 'src/admin/admin.entity';
import { AuthBothGuard } from 'src/user/guard/bothAuth.guard';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('add')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async createContact(
    @User() currentUser: UserEntity,
    @Body() createContactDto: CreateContactDto,
  ) {
    const contact = await this.contactService.createContact(
      currentUser,
      createContactDto,
    );
    return await this.contactService.buildContactResponse(contact);
  }

  @Post('answer')
  @UseGuards(AdminAuthGuard)
  @UsePipes(new BackendValidationPipe())
  async createAnswer(
    @Admin() admin: AdminEntity,
    @Body() createAnswerDto: CreateAnswerDto,
  ) {
    await this.contactService.createAnswer(admin, createAnswerDto);
    return {
      message: 'ثبت پاسخ موفقیت آمیز بود',
    };
  }

  @Get('list')
  async findAllContacts(
    @Query() query: any,
  ): Promise<ContactsResponseInterface> {
    return await this.contactService.findAllContacts(query);
  }

  @Delete(':id')
  @UseGuards(AuthBothGuard)
  async deleteOneContact(
    @Param('id') id: number,
    @User() currentUser: UserEntity,
    @Admin() admin: AdminEntity,
  ): Promise<{
    message: string;
  }> {
    await this.contactService.deleteOneContact(id, currentUser, admin);

    return {
      message: 'درخواست شما با موفقیت حذف شد',
    };
  }
}
