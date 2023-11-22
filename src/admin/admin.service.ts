import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET_KEY } from 'src/config';
import { AdminEntity } from './admin.entity';
import { AdminRegisterDto } from './dto/adminRegister.dto';
import { AdminLoginDto } from './dto/adminLogin.dto';
import { AdminResponseInterface } from './types/AdminResponse.interface';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>,
  ) {}

  async registerAdmin(registerDto: AdminRegisterDto): Promise<AdminEntity> {
    const errorResponse = {
      errors: {},
    };

    const userByEmail = await this.adminRepository.findOne({
      select: {
        email: true,
      },
      where: {
        email: registerDto.email,
      },
    });

    const userByUsername = await this.adminRepository.findOne({
      select: {
        username: true,
      },
      where: {
        username: registerDto.username,
      },
    });

    const userByMobile = await this.adminRepository.findOne({
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

    const newUser = new AdminEntity();
    newUser.isBan = '0';
    if (newUser.isBan === '1') {
      throw new HttpException(
        'شماره تماس وارد شده مسدود می باشد',
        HttpStatus.FORBIDDEN,
      );
    }

    Object.assign(newUser, registerDto);
    return await this.adminRepository.save(newUser);
  }

  async loginAdmin(loginDto: AdminLoginDto): Promise<AdminEntity> {
    const errorResponse = {
      errors: {},
    };

    const user = await this.adminRepository.findOne({
      select: {
        password: true,
        email: true,
        isBan: true,
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

    if (user.isBan === '1') {
      throw new HttpException(
        'شماره تماس وارد شده مسدود می باشد',
        HttpStatus.UNAUTHORIZED,
      );
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

  async banAdmin(currentUser: AdminEntity, id: number) {
    const admin = await this.adminRepository.findOne({
      where: { id: id },
    });

    if (!admin) {
      throw new HttpException('admin does not exist', HttpStatus.NOT_FOUND);
    }

    if (currentUser.id !== admin.id) {
      throw new HttpException(
        'شما مجاز به بن کردن کابر نمی باشید',
        HttpStatus.UNAUTHORIZED,
      );
    }

    admin.isBan = '1';

    await this.adminRepository.save(admin);

    return admin;
  }

  async findAdminByID(id: number): Promise<AdminEntity> {
    return await this.adminRepository.findOne({
      where: { id: id },
    });
  }

  async findAdminByEmail(email: string): Promise<AdminEntity> {
    return await this.adminRepository.findOne({
      where: { email: email },
    });
  }

  generateAdminJwtToken(admin: AdminEntity): string {
    const options = {
      expiresIn: '30d',
    };
    return sign(
      {
        id: admin.id,
        username: admin.username,
        email: admin.email,
      },
      ACCESS_TOKEN_SECRET_KEY,
      options,
    );
  }

  async buildUserResponse(admin: AdminEntity): Promise<AdminResponseInterface> {
    return {
      admin: {
        ...admin,
        adminToken: this.generateAdminJwtToken(admin),
      },
    };
  }

  async buildUserResponses(user: AdminEntity) {
    delete user.password;
    return {
      user: {
        ...user,
      },
    };
  }
}
