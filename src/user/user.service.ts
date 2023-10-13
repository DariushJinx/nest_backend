import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET_KEY } from 'src/config';
import { UserResponseInterface } from './types/userResponse.interface';

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
    const userCounts = await this.userRepository.count();
    newUser.role = userCounts > 3 ? 'USER' : 'ADMIN';
    Object.assign(newUser, registerDto);
    return await this.userRepository.save(newUser);
  }

  async loginUser(loginDto: LoginDto): Promise<UserEntity> {
    const errorResponse = {
      errors: {},
    };

    const user = await this.userRepository.findOne({
      select: {
        password: true,
        email: true,
      },
      where: {
        email: loginDto.email,
      },
    });

    if (!user) {
      errorResponse.errors['user'] =
        'ایمیل و یا رمز عبور وارد شده صحیح نمی باشد';
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const isPasswordCorrect = await compare(loginDto.password, user.password);

    if (!isPasswordCorrect) {
      errorResponse.errors['user'] =
        'ایمیل و یا رمز عبور وارد شده صحیح نمی باشد';
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    delete user.password;
    return user;
  }

  async findByID(id: number): Promise<UserEntity> {
    return await this.userRepository.findOne({
      where: { id: id },
    });
  }

  generateJwtToken(user: UserEntity): string {
    const options = {
      expiresIn: '30d',
    };
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      ACCESS_TOKEN_SECRET_KEY,
      options,
    );
  }

  async buildUserResponse(user: UserEntity): Promise<UserResponseInterface> {
    return {
      user: {
        ...user,
        token: this.generateJwtToken(user),
      },
    };
  }
}
