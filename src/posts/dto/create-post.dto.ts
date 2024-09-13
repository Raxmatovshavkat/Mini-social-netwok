import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class CreatePostDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    @MaxLength(1000)
    title: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(10000)
    content: string;
}
