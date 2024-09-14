import { ApiProperty } from '@nestjs/swagger';

export class LikeResponseDto {
    @ApiProperty({
        description: 'List of user IDs who liked the post',
        type: [String],
    })
    userIds: string[];
}
