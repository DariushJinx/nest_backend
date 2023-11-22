import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ExpressAdminRequest } from '../../types/expressAdminRequest.interface copy';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<ExpressAdminRequest>();
    if (request.admin) {
      return true;
    }
    throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED);
  }
}
