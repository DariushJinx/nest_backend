import {
  Body,
  Controller,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { BackendValidationPipe } from 'src/shared/pipes/backendValidation.pipe';
import { Admin } from 'src/decorators/admin.decorators';
import { AdminService } from './admin.service';
import { AdminRegisterDto } from './dto/adminRegister.dto';
import { AdminType } from './types/admin.types';
import { AdminLoginDto } from './dto/adminLogin.dto';
import { AdminResponseInterface } from './types/AdminResponse.interface';
import { AdminAuthGuard } from './guard/adminAuth.guard';
import { AdminEntity } from './admin.entity';

@Controller('')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('auth/register/admin')
  @UsePipes(new BackendValidationPipe())
  async registerUser(
    @Body() registerDto: AdminRegisterDto,
  ): Promise<AdminType> {
    const admin = await this.adminService.registerAdmin(registerDto);
    return admin;
  }

  @Post('auth/login/admin')
  @UsePipes(new BackendValidationPipe())
  async loginUser(
    @Body() loginDto: AdminLoginDto,
  ): Promise<AdminResponseInterface> {
    const admin = await this.adminService.loginAdmin(loginDto);
    return await this.adminService.buildUserResponse(admin);
  }

  @Put('admin/ban/:id')
  @UseGuards(AdminAuthGuard)
  async followProfile(
    @Admin() currentAdmin: AdminEntity,
    @Param('id') id: number,
  ) {
    const admin = await this.adminService.banAdmin(currentAdmin, id);
    return await this.adminService.buildUserResponse(admin);
  }
}
