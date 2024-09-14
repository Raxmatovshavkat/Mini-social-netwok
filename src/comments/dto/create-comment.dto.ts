import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Content of the comment',
    example: 'This is a sample comment.',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  content: string;

  @ApiProperty({
    description: 'ID of the post to which the comment belongs',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  readonly postId: string;
}
