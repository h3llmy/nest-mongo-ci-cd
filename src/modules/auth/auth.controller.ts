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
  ApiNotFoundResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { ForgetPasswordDto } from './dto/forgetPassword.dto';

/**
 * Controller responsible for handling authentication-related requests.
 */
@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  @ApiCreatedResponse({
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
    await this.authService.register(registerDto);
    return { message: 'register success' };
  }

  /**
   * Endpoint to verify user's email.
   * @param token - Token sent to user's email for verification.
   * @returns Success message if email verification is successful.
   */
  @Put('email-verification/:token')
  @ApiOperation({ summary: 'Verify user email' })
  @ApiOkResponse({
    description: 'User email verified successfully.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
      example: {
        message: 'User email verified successfully.',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid token',
    schema: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' },
      },
      example: {
        error: 'Bad Request',
        message: 'invalid token',
      },
    },
  })
  async verificationEmail(@Param('token') token: string) {
    await this.authService.verifyEmail(token);
    return { message: 'User email verified successfully.' };
  }

  /**
   * Request to reset password for a user.
   * @param forgetPasswordDto - DTO containing user's email for password reset.
   * @returns Success message if the email is sent successfully.
   */
  @Post('forget-password')
  @ApiOperation({ summary: 'Request to reset password' })
  @ApiOkResponse({
    description: 'Email sent successfully.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
      example: {
        message: 'Email has been sent.',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid User Account.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
      example: {
        message: 'user is not active',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User Not Found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
      example: {
        message: 'user not found',
      },
    },
  })
  forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    this.authService.forgetPassword(forgetPasswordDto.email);
    return { message: 'Email has been sent.' };
  }
}
