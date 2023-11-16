import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { FollowEntity } from './follow.entity';
import { ProfileType } from './types/profile.types';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ProfileResponseInterface } from './types/profileResponse.interface';

export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
  ) {}

  async getProfile(
    currentUserId: number,
    profileUsername: string,
  ): Promise<ProfileType> {
    const user = await this.userRepository.findOne({
      where: { username: profileUsername },
      relations: [
        'favorites',
        'favoritesProducts',
        'favoriteCourses',
        'comments',
      ],
    });

    user.favoritesProducts.map((product) => delete product.supplier.password);
    user.favorites.map((blog) => delete blog.author.password);
    user.favoriteCourses.map((course) => delete course.teacher.password);

    if (!user) {
      throw new HttpException('پروفایلی یافت نشد ...', HttpStatus.NOT_FOUND);
    }

    const follow = await this.followRepository.findOne({
      where: {
        followerId: currentUserId,
        followingId: user.id,
      },
    });

    return { ...user, following: Boolean(follow) };
  }

  async followProfile(currentUser: UserEntity, profileUsername: string) {
    const user = await this.userRepository.findOne({
      where: { username: profileUsername },
    });

    if (!user) {
      throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND);
    }

    if (currentUser.id === user.id) {
      throw new HttpException(
        'follower and following cant be equal',
        HttpStatus.BAD_REQUEST,
      );
    }
    const follow = await this.followRepository.findOne({
      where: { followerId: currentUser.id, followingId: user.id },
    });

    if (!follow) {
      const followToCreate = new FollowEntity();
      followToCreate.followerId = currentUser.id;
      followToCreate.followingId = user.id;
      await this.followRepository.save(followToCreate);
    }

    return { ...user, following: true };
  }

  async unFollowProfile(
    currentUserId: number,
    profileUsername: string,
  ): Promise<ProfileType> {
    const user = await this.userRepository.findOne({
      where: { username: profileUsername },
    });

    if (!user) {
      throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND);
    }

    if (currentUserId === user.id) {
      throw new HttpException(
        'follower and following cant be equal',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.followRepository.delete({
      followerId: currentUserId,
      followingId: user.id,
    });

    return { ...user, following: false };
  }

  async buildProfileResponse(
    profile: ProfileType,
  ): Promise<ProfileResponseInterface> {
    delete profile.email;
    delete profile.password;
    return { profile };
  }
}
