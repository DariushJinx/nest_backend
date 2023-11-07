import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { User } from '../decorators/user.decorators';
import { ProfileResponseInterface } from './types/profileResponse.interface';
import { AuthGuard } from 'src/user/guard/auth.guard';
import { UserEntity } from 'src/user/user.entity';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  async getProfile(
    @User() currentUserId: number,
    @Param('username') profileUsername: string,
  ): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.getProfile(
      currentUserId,
      profileUsername,
    );
    return await this.profileService.buildProfileResponse(profile);
  }

  @Post(':username/follow')
  @UseGuards(AuthGuard)
  async followProfile(
    @User() currentUser: UserEntity,
    @Param('username') profileUsername: string,
  ) {
    const profile = await this.profileService.followProfile(
      currentUser,
      profileUsername,
    );
    return await this.profileService.buildProfileResponse(profile);
  }

  @Delete(':username/follow')
  @UseGuards(AuthGuard)
  async unFollowProfile(
    @User('id') currentUserId: number,
    @Param('username') profileUsername: string,
  ): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.unFollowProfile(
      currentUserId,
      profileUsername,
    );
    return await this.profileService.buildProfileResponse(profile);
  }
}
