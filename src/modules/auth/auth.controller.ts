import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Put,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  ApiOkResponse,
  ApiTags,
  ApiBadRequestResponse,
  ApiUnprocessableEntityResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

/**
 * Controller responsible for handling authentication-related requests.
 */
@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Endpoint for user login.
   * @param loginDto - DTO containing login credentials.
   * @returns A token if login is successful.
   */
  @Post('login')
  @ApiOperation({ summary: 'login with available user account' })
  @ApiOkResponse({
    description: 'Token generated successfully.',
    schema: {
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
      example: {
        accessToken: 'your-access-token',
        refreshToken: 'your-refresh-token',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid login credentials.',
    schema: {
      properties: {
        error: { type: 'string' },
        message: { type: 'string' },
      },
      example: {
        error: 'Bad Request',
        message: 'User not found',
      },
    },
  })
  @ApiUnprocessableEntityResponse({
    description: 'Error Validation',
    schema: {
      properties: {
        error: {
          type: 'object',
          properties: {
            username: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            password: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
      },
      example: {
        error: {
          username: [
            'username must be a string',
            'username should not be empty',
          ],
          password: [
            'password must be a string',
            'password should not be empty',
          ],
        },
        message: 'Error Validation',
      },
    },
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Endpoint for user registration.
   * @param registerDto - DTO containing registration details.
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'register new user account' })
  @ApiOkResponse({
    description: 'User registered successfully.',
    schema: {
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
      example: {
        accessToken: 'your-access-token',
        refreshToken: 'your-refresh-token',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
    schema: {
      properties: {
        error: { type: 'string' },
        message: { type: 'string' },
      },
      example: {
        error: 'Bad Request',
        message: 'password and confirm password not match',
      },
    },
  })
  @ApiUnprocessableEntityResponse({
    description: 'Error Validation',
    schema: {
      type: 'object',
      properties: {
        error: {
          type: 'object',
          properties: {
            username: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            email: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            password: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
        message: { type: 'string' },
      },
      example: {
        error: {
          username: ['username should not be empty'],
          email: ['email should not be empty'],
          password: ['password should not be empty'],
        },
        message: 'Validation failed.',
      },
    },
  })
  async register(@Body() registerDto: RegisterDto) {
    const registerToken = await this.authService.register(registerDto);
    this.mailerService.sendMail({
      to: registerDto.email,
      subject: 'register user',
      template: 'register',
      context: {
        registerToken,
      },
    });
    return { message: 'register success' };
  }

  @Put('verification/:token')
  async verificationEmail(@Param('token') token: string) {
    const redirectUrlPrefix: string = this.config.get<string>('REGISTER_URL');
    return token;
  }
}
