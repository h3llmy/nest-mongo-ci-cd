import { JwtService } from '@nestjs/jwt';
import { ILoginTokenPayload, ILoginTokenResponse } from './auth.service';
import { ConfigService } from '@nestjs/config';

export class AuthTokenService {
  constructor(
    protected readonly jwtService: JwtService,
    protected readonly config: ConfigService,
  ) {}
  /**
   * Creates access and refresh tokens based on provided token payload.
   * @param tokenPayload - Payload to be signed into the token.
   * @returns Object containing access and refresh tokens.
   */
  createLoginToken(tokenPayload: ILoginTokenPayload): ILoginTokenResponse {
    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
    });
    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
    });
    return { accessToken, refreshToken };
  }

  createRegisterToken(tokenPayload: ILoginTokenPayload): string {
    return this.jwtService.sign(tokenPayload, {
      secret: this.config.get<string>('REGISTER_TOKEN_SECRET'),
    });
  }
}
