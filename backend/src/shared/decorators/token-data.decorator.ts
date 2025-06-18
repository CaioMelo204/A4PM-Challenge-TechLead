import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenDataInterface } from './token-data.interface';

export const TokenDataDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TokenDataInterface => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
