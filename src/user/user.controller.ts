import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { UserType } from './types/user.types';
import { BackendValidationPipe } from 'src/shared/pipes/backendValidation.pipe';
import { LoginDto } from './dto/login.dto';
import { UserResponseInterface } from './types/userResponse.interface';

@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @UsePipes(new BackendValidationPipe())
  async registerUser(@Body() registerDto: RegisterDto): Promise<UserType> {
    const user = await this.userService.registerUser(registerDto);
    return user;
  }

  @Post('login')
  @UsePipes(new BackendValidationPipe())
  async loginUser(@Body() loginDto: LoginDto): Promise<UserResponseInterface> {
    const user = await this.userService.loginUser(loginDto);
    return await this.userService.buildUserResponse(user);
  }
}
