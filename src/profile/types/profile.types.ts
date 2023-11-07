import { UserType } from '../../user/types/user.types';

export type ProfileType = UserType & { following: boolean };
