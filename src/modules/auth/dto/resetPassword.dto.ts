import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * Data transfer object (DTO) for update password for user.
 */
export class ResetPasswordDto {
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
