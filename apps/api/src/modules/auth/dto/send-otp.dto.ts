import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({ example: '+84912345678' })
  @IsString()
  @Matches(/^\+[1-9]\d{7,14}$/, { message: 'Invalid phone number format' })
  phoneNumber: string;
}
