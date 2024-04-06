import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../user/entities/user.entity';
import { ObjectId } from 'mongoose';
import { EncryptionService } from '../common/encryption.service';
import { AuthTokenService } from './authToken.service';

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
  constructor(
    private readonly userService: UserService,
    private readonly encryption: EncryptionService,
    private readonly authTokenService: AuthTokenService,
  ) {}

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

    return this.authTokenService.createLoginToken(tokenPayload);
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
    return this.authTokenService.createRegisterToken(tokenPayload);
  }
}
