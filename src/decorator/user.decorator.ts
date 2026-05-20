import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@/users/entities/user.entity';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (data: keyof User, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
