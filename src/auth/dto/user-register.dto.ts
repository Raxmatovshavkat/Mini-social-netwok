import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
    @ApiProperty({ description: 'The email of the user', example: 'user@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'The full name of the user', example: 'John Doe' })
    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    @MaxLength(1000)
    @Matches(/^[a-zA-Zа-яА-ЯёЁ]+$/, { message: 'Name must contain only letters' })
    full_name: string;

    @ApiProperty({ description: 'The password of the user', example: 'password123' })
    @IsString()
    @MinLength(8)
    password: string;

    @ApiProperty({ description: 'The status of the user', example: 'inactive', enum: ['inactive', 'active'] })
    @IsOptional()
    @IsEnum(['inactive', 'active'])
    status: 'inactive' | 'active';
}


