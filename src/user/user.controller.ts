import { Admin } from './../decorators/admin.decorators';
import {
  Body,
  Controller,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { UserType } from './types/user.types';
import { BackendValidationPipe } from '../shared/pipes/backendValidation.pipe';
import { LoginDto } from './dto/login.dto';
import { UserResponseInterface } from './types/userResponse.interface';
import { AdminAuthGuard } from '../admin/guard/adminAuth.guard';
import { AdminEntity } from '../admin/admin.entity';

@Controller('')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('auth/register')
  @UsePipes(new BackendValidationPipe())
  async registerUser(@Body() registerDto: RegisterDto): Promise<UserType> {
    const user = await this.userService.registerUser(registerDto);
    return user;
  }

  @Post('auth/login')
  @UsePipes(new BackendValidationPipe())
  async loginUser(@Body() loginDto: LoginDto): Promise<UserResponseInterface> {
    const user = await this.userService.loginUser(loginDto);
    return await this.userService.buildUserResponse(user);
  }

  @Put('user/ban/:id')
  @UseGuards(AdminAuthGuard)
  async followProfile(@Admin() admin: AdminEntity, @Param('id') id: number) {
    const user = await this.userService.banUser(admin, id);
    return await this.userService.buildBanAdminResponse(user);
  }
}
