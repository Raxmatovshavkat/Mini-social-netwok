import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    description: 'Title of the post',
    example: 'A New Beginning',
    minLength: 5,
    maxLength: 1000,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  title: string;

  @ApiProperty({
    description: 'Content of the post',
    example:
      'This is the content of the post. It can be quite lengthy and detailed.',
    maxLength: 10000,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(10000)
  content: string;
}
