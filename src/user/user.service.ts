import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async registerUser(registerDto: RegisterDto): Promise<UserEntity> {
    const errorResponse = {
      errors: {},
    };

    const userByEmail = await this.userRepository.findOne({
      select: {
        email: true,
      },
      where: {
        email: registerDto.email,
      },
    });

    const userByUsername = await this.userRepository.findOne({
      select: {
        username: true,
      },
      where: {
        username: registerDto.username,
      },
    });

    const userByMobile = await this.userRepository.findOne({
      select: {
        mobile: true,
      },
      where: {
        mobile: registerDto.mobile,
      },
    });

    if (userByEmail) {
      errorResponse.errors['email'] = 'ایمیل وارد شده از قبل موجود می باشد';
    }

    if (userByMobile) {
      errorResponse.errors['mobile'] =
        'شماره تماس وارد شده از قبل موجود می باشد';
    }

    if (userByUsername) {
      errorResponse.errors['username'] =
        'نام کاربری وارد شده از قبل موجود می باشد';
    }

    if (userByEmail || userByUsername || userByMobile) {
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const newUser = new UserEntity();
    Object.assign(newUser, registerDto);
    return await this.userRepository.save(newUser);
  }
}
