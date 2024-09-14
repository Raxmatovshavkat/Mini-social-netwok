import { ApiProperty } from '@nestjs/swagger';

export class RemoveLikeDto {
    @ApiProperty({
        description: 'ID of the post to unlike',
        example: 'some-post-id',
    })
    postId: string;

    @ApiProperty({
        description: 'ID of the user removing the like',
        example: 'some-user-id',
    })
    userId: string;
}
