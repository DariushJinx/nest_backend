import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContactEntity } from './contact.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { CreateContactDto } from './dto/createContact.dto';
import { ContactResponseInterface } from './types/contactResponse.interface';
import { ContactsResponseInterface } from './types/contactsResponse.interface';
import { CreateAnswerDto } from './dto/createAnswer.dto';
import { createTransport } from 'nodemailer';
import { AdminEntity } from '../admin/admin.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactEntity)
    private readonly contactRepository: Repository<ContactEntity>,
  ) {}

  async createContact(
    currentUser: UserEntity,
    createContactDto: CreateContactDto,
  ): Promise<ContactEntity> {
    if (!currentUser) {
      throw new HttpException('شما باید لاگین کنید', HttpStatus.UNAUTHORIZED);
    }

    const contact = new ContactEntity();

    Object.assign(contact, createContactDto);
    contact.answer = false;

    return await this.contactRepository.save(contact);
  }

  async createAnswer(admin: AdminEntity, createAnswerDto: CreateAnswerDto) {
    if (!admin) {
      throw new HttpException(
        'شما مجاز به پاسخ نیستید',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const transporter = createTransport({
      service: 'gmail',
      auth: {
        user: 'www.dariushkhazaei629@gmail.com',
        pass: 'xgcm jrbi haww bcxu',
      },
    });
    const mailOptions = {
      from: 'www.dariushkhazaei629@gamil.com',
      to: createAnswerDto.email,
      subject: 'پاسخ ایمیل شما از طرف سایت فلان',
      text: createAnswerDto.answer,
    };

    const contact = await this.contactRepository.update(
      {
        email: createAnswerDto.email,
      },
      { answer: true },
    );

    transporter.sendMail(mailOptions, async function (error, info) {
      if (error) {
        throw new HttpException('خطای سرور', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      return await this.contactRepository.save(contact);
    });
    return {
      message: 'ثبت پاسخ موفقیت آمیز بود',
    };
  }

  async findAllContacts(query: any): Promise<ContactsResponseInterface> {
    const queryBuilder = this.contactRepository.createQueryBuilder('contact');

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    queryBuilder.orderBy('contact.createdAt', 'DESC');

    const contactsCount = await queryBuilder.getCount();
    const contacts = await queryBuilder.getMany();
    return { contacts, contactsCount };
  }

  async deleteOneContact(
    id: number,
    currentUser: UserEntity,
    admin: AdminEntity,
  ): Promise<{
    message: string;
  }> {
    const contact = await this.contactRepository.findOne({ where: { id: id } });
    if (!contact) {
      throw new HttpException('ارتباط مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }
    if (currentUser) {
      if (!currentUser) {
        throw new HttpException(
          'شما مجاز به حذف کامنت نیستید',
          HttpStatus.FORBIDDEN,
        );
      }

      await this.contactRepository.delete({ id });

      return {
        message: 'درخواست شما با موفقیت حذف شد',
      };
    } else if (admin) {
      if (!admin) {
        throw new HttpException(
          'شما مجاز به حذف کامنت نیستید',
          HttpStatus.FORBIDDEN,
        );
      }

      await this.contactRepository.delete({ id });

      return {
        message: 'درخواست شما با موفقیت حذف شد',
      };
    }
  }

  async buildContactResponse(
    contact: ContactEntity,
  ): Promise<ContactResponseInterface> {
    return { contact };
  }
}
