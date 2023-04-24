import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export const AccessToken = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const [, accessToken] = request.headers.authorization.split(" ");
  return accessToken;
});
