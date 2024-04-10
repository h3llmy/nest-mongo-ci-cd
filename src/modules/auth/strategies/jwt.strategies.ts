import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/modules/user/user.service';
import { ILoginTokenPayload } from '../auth.service';

/**
 * JWT (JSON Web Token) authentication strategy.
 * Extends `PassportStrategy` from `@nestjs/passport`.
 */
@Injectable()
export class JwtStrategies extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('ACCESS_TOKEN_SECRET'),
    } as StrategyOptions);
  }

  /**
   * Method to validate the payload extracted from the JWT token.
   * @param payload - Payload extracted from the JWT token.
   * @returns User object if validation is successful.
   * @throws UnauthorizedException if the token is invalid.
   */
  async validate(payload: ILoginTokenPayload) {
    // Validate the user based on the payload data
    const userCheck = await this.userService
      .findById(payload.id)
      .lean()
      .orFail(new UnauthorizedException('Invalid token'));

    return userCheck;
  }
}
