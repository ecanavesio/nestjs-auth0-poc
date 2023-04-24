import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import clone from "clone";
import axios, { AxiosInstance } from "axios";
import { ManagementClient } from "auth0";

type OauthTokenParamsType = {
  grant_type: string;
  redirect_uri: string;
  client_id: string;
  client_secret: string;
  audience: string;
};

@Injectable()
export class AuthenticationService {
  private readonly authorizeUrl: string;

  private readonly auth0Client: AxiosInstance;

  private readonly oauthTokenParams: OauthTokenParamsType;

  private readonly logger: Logger;

  private readonly auth0Manager: ManagementClient;

  constructor(configService: ConfigService) {
    const baseURL = configService.get("AUTH0_BASE_URL");
    const clientId = configService.get("AUTH0_CLIENT_ID");
    const clientSecret = configService.get("AUTH0_CLIENT_SECRET");
    const issuerBaseURL = configService.get("AUTH0_DOMAIN");
    const audience = configService.get("AUTH0_AUDIENCE");

    const redirectUri = `${baseURL}/auth/callback`;

    const authorizeUrlParmas = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      audience,
      scope: "openid read profile",
    });

    this.authorizeUrl = `${issuerBaseURL}/authorize?${authorizeUrlParmas.toString()}`;

    this.auth0Client = axios.create({
      baseURL: issuerBaseURL,
    });

    this.oauthTokenParams = {
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      audience,
    };

    this.logger = new Logger(AuthenticationService.name);

    this.auth0Manager = new ManagementClient({
      domain: issuerBaseURL,
      clientId,
      clientSecret,
      audience,
    });
  }

  getAuthorizeUrl(): string {
    return this.authorizeUrl;
  }

  async getToken(code: string): Promise<any> {
    try {
      const params = clone(this.oauthTokenParams);
      params.code = code;

      const response = await this.auth0Client.post("/oauth/token", params);

      return response.data;
    } catch (error) {
      this.logger.error(error);
      throw new UnauthorizedException(error);
    }
  }

  async getUser(accessToken: string): Promise<any> {
    try {
      const response = await this.auth0Client.get("/userinfo", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error(error);
      throw new UnauthorizedException(error);
    }
  }
}
