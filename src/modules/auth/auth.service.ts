import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../user/entities/user.entity';
import { ObjectId } from 'mongoose';
import { EncryptionService } from '../common/encryption.service';

export enum JwtType {
  LOGIN = 'login',
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

/**
 * Service responsible for authentication-related operations.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly config: ConfigService,
    private readonly encryption: EncryptionService,
  ) {}

  /**
   * Validates user credentials and generates login tokens.
   * @param loginDto - Object containing username and password for login.
   * @returns Object containing access and refresh tokens.
   * @throws NotFoundException if user with provided username is not found.
   */
  async login({ username, password }: LoginDto) {
    const userCheck = await this.userService
      .findByUsername(username)
      .orFail(new BadRequestException('User not found'));

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

    return this.createLoginToken(tokenPayload);
  }

  /**
   * Registers a new user and generates login tokens.
   * @param registerDto - Object containing registration details.
   * @returns Object containing access and refresh tokens.
   */
  async register({ email, password, username, confirmPassword }: RegisterDto) {
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
      type: JwtType.LOGIN,
    };
    return this.createLoginToken(tokenPayload);
  }

  /**
   * Creates access and refresh tokens based on provided token payload.
   * @param tokenPayload - Payload to be signed into the token.
   * @returns Object containing access and refresh tokens.
   */
  createLoginToken(tokenPayload: ILoginTokenPayload) {
    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
    });
    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
    });
    return { accessToken, refreshToken };
  }
}
