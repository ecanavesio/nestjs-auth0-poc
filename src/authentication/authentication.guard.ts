import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { expressJwtSecret } from "jwks-rsa";
import { expressjwt, GetVerificationKey } from "express-jwt";
import { Request, Response, NextFunction } from "express";
import { ConfigService } from "@nestjs/config";
import { promisify } from "util";

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private checkJwt: (req: Request, res: Response, next?: NextFunction) => Promise<void | NodeJS.Immediate>;

  private readonly logger: Logger;

  constructor(configService: ConfigService) {
    const audience = configService.get("AUTH0_AUDIENCE");
    const issuer = configService.get("AUTH0_DOMAIN");

    this.checkJwt = promisify(
      expressjwt({
        secret: expressJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 10,
          jwksUri: `${issuer}/.well-known/jwks.json`,
        }) as GetVerificationKey,
        audience,
        algorithms: ["RS256"],
      }),
    );

    this.logger = new Logger(AuthenticationGuard.name);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const req: Request = context.getArgByIndex(0);
      const res: Response = context.getArgByIndex(1);

      await this.checkJwt(req, res);
      return true;
    } catch (error) {
      this.logger.error(error);
      throw new UnauthorizedException(error);
    }
  }
}
