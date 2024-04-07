import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * Data transfer object (DTO) for forget password credentials.
 */
export class ForgetPasswordDto {
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
}
