import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * Data transfer object (DTO) for registering a new user.
 */
export class RegisterDto {
  /**
   * The username for the new user.
   * @type {string}
   */
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'harumi',
  })
  username: string;

  /**
   * The email address for the new user.
   * @type {string}
   */
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @ApiProperty({
    example: 'harumi@gmail.com',
  })
  email: string;

  /**
   * The password for the new user.
   * Must be between 8 and 12 characters long.
   * @type {string}
   */
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(12)
  @ApiProperty({
    example: 'password123',
  })
  password: string;

  /**
   * The password for the new user.
   * Must be between 8 and 12 characters long.
   * @type {string}
   */
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(12)
  @ApiProperty({
    example: 'password123',
  })
  confirmPassword: string;
}
