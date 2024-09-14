import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateRefreshTokenDto {
  @ApiProperty({ description: 'The refresh token' })
  @IsString()
  token: string;
}
