import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactEntity } from './contact.entity';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { UserEntity } from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContactEntity, UserEntity])],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
