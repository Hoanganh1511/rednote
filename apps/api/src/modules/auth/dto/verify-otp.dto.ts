import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ example: '+84912345678' })
  @IsString()
  @Matches(/^\+[1-9]\d{7,14}$/, { message: 'Invalid phone number format' })
  phoneNumber: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  code: string;
}
