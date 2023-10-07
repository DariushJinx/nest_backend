import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { UserType } from './types/user.types';
import { BackendValidationPipe } from 'src/shared/pipes/backendValidation.pipe';

@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @UsePipes(new BackendValidationPipe())
  async registerUser(@Body() registerDto: RegisterDto): Promise<UserType> {
    console.log('registerDto : ', registerDto);
    const user = await this.userService.registerUser(registerDto);
    return user;
  }
}
