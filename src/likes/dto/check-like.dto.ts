import { ApiProperty } from '@nestjs/swagger';

export class CheckLikeResponseDto {
  @ApiProperty({
    description: 'Whether the user has liked the post',
    example: true,
  })
  hasLiked: boolean;
}
