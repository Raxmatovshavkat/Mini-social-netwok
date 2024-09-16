import { ApiProperty } from '@nestjs/swagger';

export class CreateLikeDto {
  @ApiProperty({
    description: 'ID of the post to like',
    example: 'some-post-id',
  })
  postId: string;

  @ApiProperty({
    description: 'ID of the user liking the post',
    example: 'some-user-id',
  })
  userId: string;
}

