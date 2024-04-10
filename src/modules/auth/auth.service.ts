import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../user/entities/user.entity';
import { ObjectId } from 'mongoose';
import { EncryptionService } from '../common/encryption.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { RandomService } from '../common/random.service';

export enum JwtType {
  LOGIN = 'login',
  REGISTER = 'register',
}

/**
 * Interface representing the payload of a JWT token used for login.
 */
export interface ILoginTokenPayload {
  id: ObjectId;
  username: string;
  email: string;
  role: UserRole;
  type: JwtType;
}

export interface ILoginTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Service responsible for authentication-related operations.
 */
@Injectable()
export class AuthService {
  private readonly REGISTER_EXPIRED_TIME: string | number = '60s';
  private readonly ACCESS_EXPIRED_TIME: string | number = '30s';
  private readonly REFRESH_EXPIRED_TIME: string | number = '30d';
  private readonly ACCESS_TOKEN_SECRET: string;
  private readonly REFRESH_TOKEN_SECRET: string;
  private readonly REGISTER_TOKEN_SECRET: string;

  constructor(
    private readonly userService: UserService,
    private readonly encryption: EncryptionService,
    protected readonly jwtService: JwtService,
    protected readonly config: ConfigService,
    protected readonly mailerService: MailerService,
    protected readonly randomService: RandomService,
  ) {
    this.ACCESS_TOKEN_SECRET = config.get<string>('ACCESS_TOKEN_SECRET');
    this.REFRESH_TOKEN_SECRET = config.get<string>('REFRESH_TOKEN_SECRET');
    this.REGISTER_TOKEN_SECRET = config.get<string>('REGISTER_TOKEN_SECRET');
  }

  /**
   * Validates user credentials and generates login tokens.
   * @param loginDto - Object containing username and password for login.
   * @returns Object containing access and refresh tokens.
   * @throws NotFoundException if user with provided username is not found.
   */
  async login({ username, password }: LoginDto): Promise<ILoginTokenResponse> {
    const userCheck = await this.userService
      .findByUsername(username)
      .orFail(new BadRequestException('User not found'));

    if (userCheck.isVerified === false) {
      throw new BadRequestException('user is not verified');
    }

    const isPasswordMatch = await this.encryption.compare(
      password,
      userCheck.password,
    );
    if (!isPasswordMatch) {
      throw new BadRequestException('User not found');
    }

    const tokenPayload: ILoginTokenPayload = {
      id: userCheck._id,
      username: userCheck.username,
      email: userCheck.email,
      role: userCheck.role,
      type: JwtType.LOGIN,
    };

    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.ACCESS_TOKEN_SECRET,
      expiresIn: this.ACCESS_EXPIRED_TIME,
    });
    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.REFRESH_TOKEN_SECRET,
      expiresIn: this.REFRESH_EXPIRED_TIME,
    });

    return { accessToken, refreshToken };
  }

  /**
   * Registers a new user and generates login tokens.
   * @param registerDto - Object containing registration details.
   * @returns Object containing access and refresh tokens.
   */
  async register({
    email,
    password,
    username,
    confirmPassword,
  }: RegisterDto): Promise<string> {
    if (password !== confirmPassword) {
      throw new BadRequestException('password and confirm password not match');
    }
    const user = await this.userService.create({
      username,
      email,
      password,
      role: UserRole.USER,
    });

    const tokenPayload: ILoginTokenPayload = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      type: JwtType.REGISTER,
    };
    const registerToken: string = this.jwtService.sign(tokenPayload, {
      secret: this.REGISTER_TOKEN_SECRET,
      expiresIn: this.REGISTER_EXPIRED_TIME,
    });

    const redirectUrlPrefix: string = this.config.get<string>('REGISTER_URL');

    this.mailerService.sendMail({
      to: user.email,
      subject: 'register user',
      template: 'auth/register',
      context: {
        url: `${redirectUrlPrefix}/${registerToken}`,
      },
    });
    return registerToken;
  }

  /**
   * Verifies the email of a user based on the provided token.
   * @param token - The token used to verify the user's email.
   * @returns The user with the email verified.
   * @throws BadRequestException if the token is invalid or expired, or if the user is already verified.
   */
  async verifyEmail(token: string) {
    try {
      const decodedToken = this.jwtService.verify<ILoginTokenPayload>(token, {
        secret: this.REGISTER_TOKEN_SECRET,
      });

      if (!decodedToken || decodedToken.type !== JwtType.REGISTER) {
        throw new BadRequestException('invalid token');
      }

      const userFind = await this.userService.findOne({
        _id: decodedToken.id,
      });
      if (userFind.isVerified) {
        throw new BadRequestException('user already verified');
      }
      if (!userFind) {
        throw new BadRequestException('invalid token');
      }

      userFind.isVerified = true;
      await userFind.save();
      return userFind;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException('Token expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new BadRequestException('Invalid token');
      }
      throw error;
    }
  }

  async forgetPassword(email: string) {
    const userFind = await this.userService.findByEmail(email);
    if (!userFind.isActive) {
      throw new BadRequestException('user is not active');
    }
    if (!userFind.isVerified) {
      throw new BadRequestException('user is not verified');
    }

    this.mailerService.sendMail({
      to: userFind.email,
      subject: 'Reset Password',
      template: 'auth/forgetPassword',
      context: {},
    });
  }
}
