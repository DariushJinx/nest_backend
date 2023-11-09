import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { UserService } from '../user.service';
import { ExpressRequest } from 'src/types/expressRequest.interface';
import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET_KEY } from 'src/config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: ExpressRequest, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      req.user = null;
      next();
      return;
    }

    const token = req.headers.authorization.split(' ')[1];

    try {
      verify(token, ACCESS_TOKEN_SECRET_KEY, async (err: any, payload: any) => {
        try {
          if (err) {
            throw new HttpException(
              'وارد حساب کاربری خود شوید...',
              HttpStatus.UNAUTHORIZED,
            );
          } else {
            const { email } = payload;
            const user = await this.userService.findByEmail(email);
            if (!user) {
              throw new HttpException(
                'وارد حساب کاربری خود شوید...',
                HttpStatus.UNAUTHORIZED,
              );
            }
            req.user = user;
            return next();
          }
        } catch (err) {
          next(err);
        }
      });
    } catch (err) {
      req.user = null;
      next(err);
    }
  }
}
