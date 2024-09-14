import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsEnum,
  IsBoolean,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The full name of the user',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  @Matches(/^[a-zA-Zа-яА-ЯёЁ]+$/, { message: 'Name must contain only letters' })
  full_name: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'password123',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'The status of the user',
    example: 'inactive',
    enum: ['inactive', 'active'],
  })
  @IsEnum(['inactive', 'active'])
  @IsOptional()
  status: 'inactive' | 'active';
}
