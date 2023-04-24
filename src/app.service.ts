import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { Message } from "./types/Message";
import { AuthenticationService } from "./authentication/authentication.service";

@Injectable()
export class AppService {
  constructor(private readonly authenticationService: AuthenticationService, private readonly httpService: HttpService) {}

  getHello(): Message {
    return {
      message: "Hello World!",
    };
  }

  getAuth0LoginUrl(): string {
    return this.authenticationService.getAuthorizeUrl();
  }

  getProfile(): void {
    this.httpService.get("https://membranelabs.us.auth0.com/userinfo");
  }

  async callback(code: string): Promise<Message> {
    const data = await this.authenticationService.getToken(code);
    return {
      message: "You are authenticated",
      data,
    };
  }

  async getUser(accessToken): Promise<Message> {
    const data = await this.authenticationService.getUser(accessToken);
    return {
      message: "Get Userinfo sucessfully completed",
      data,
    };
  }
}
