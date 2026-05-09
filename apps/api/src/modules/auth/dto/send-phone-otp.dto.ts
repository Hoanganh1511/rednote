import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendPhoneOtpDto {
  @ApiProperty({ example: '+84912345678' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}
