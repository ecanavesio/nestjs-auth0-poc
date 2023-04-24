import { Body, Controller, Get, Logger, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { Request, Response } from "express";
import { AppService } from "./app.service";
import { AuthenticationGuard } from "./authentication/authentication.guard";
import { AccessToken } from "./decorators/access-token.decorator";
import { Message } from "./types/Message";

@Controller()
export class AppController {
  private readonly logger: Logger;

  private readonly whitelistDomains = ["membranelabs.com", "ratherlabs.com", "accelone.com"];

  constructor(private readonly appService: AppService) {
    this.logger = new Logger(AppController.name);
  }

  @Get()
  getHello(): Message {
    return this.appService.getHello();
  }

  @Get("/login")
  public login(@Res() res: Response): void {
    const redirectUrl = this.appService.getAuth0LoginUrl();
    this.logger.log(redirectUrl);
    res.redirect(redirectUrl);
  }

  @Get("/auth/callback")
  public callback(@Query("code") code: string): Promise<Message> {
    this.logger.log(code);
    return this.appService.callback(code);
  }

  @Get("/profile")
  @UseGuards(AuthenticationGuard)
  public getProfile(@AccessToken() accessToken: string): Promise<Message> {
    return this.appService.getUser(accessToken);
  }

  @Get("/authorize")
  public authorize(@Req() req: Request, @Res() res: Response): void {
    const redirectUrl = this.appService.getAuth0LoginUrl();
    this.logger.log(redirectUrl);
    res.redirect(redirectUrl);
  }

  @Post("/whitelist")
  public whitelistVerification(@Body() body: { email: string }): Message & { status: boolean } {
    const [, domain] = body.email.trim().split("@");

    if (this.whitelistDomains.includes(domain)) {
      return {
        message: "The emails is authorized",
        status: true,
      };
    } else {
      return {
        message: "The emails isn't authorized",
        status: false,
      };
    }
  }
}
