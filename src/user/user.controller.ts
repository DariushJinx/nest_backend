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
import { BackendValidationPipe } from 'src/shared/pipes/backendValidation.pipe';
import { LoginDto } from './dto/login.dto';
import { UserResponseInterface } from './types/userResponse.interface';
import { AuthGuard } from './guard/auth.guard';
import { User } from 'src/decorators/user.decorators';
import { UserEntity } from './user.entity';

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
  @UseGuards(AuthGuard)
  async followProfile(
    @User() currentUser: UserEntity,
    @Param('id') id: number,
  ) {
    const user = await this.userService.banUser(currentUser, id);
    return await this.userService.buildUserResponse(user);
  }
}
