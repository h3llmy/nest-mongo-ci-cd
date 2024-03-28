import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Data transfer object (DTO) for login credentials.
 */
export class LoginDto {
  /**
   * The username for authentication.
   * @type {string}
   */
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'your username',
  })
  username: string;

  /**
   * The password for authentication.
   * @type {string}
   */
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'password123',
  })
  password: string;
}
