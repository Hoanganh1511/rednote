import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin or user@example.com', description: 'Username or email' })
  @IsString()
  identifier: string;

  @ApiProperty({ example: 'strongpassword' })
  @IsString()
  @MinLength(8)
  password: string;
}
