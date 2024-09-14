import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Req,
  Res,
  HttpStatus,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { LikesService } from './likes.service';
import { Response } from 'express';
import { CustomRequest } from 'custom-request.interface';
import { LikeResponseDto } from './dto/like-response.dto';
import { CheckLikeResponseDto } from './dto/check-like.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';

@ApiTags('likes')
@Controller('posts')
export class LikesController {
  constructor(private readonly likesService: LikesService) { }
  @UseGuards(JwtAuthGuard)
  @Post(':postId/like')
  @ApiOperation({ summary: 'Like a post' })
  @ApiParam({
    name: 'postId',
    type: String,
    description: 'ID of the post to like',
  })
  @ApiResponse({ status: 201, description: 'Post liked successfully' })
  @ApiResponse({ status: 404, description: 'Post or user not found' })
  async likePost(
    @Param('postId') postId: string,
    @Req() req: CustomRequest,
    @Res() res: Response,
  ) {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('User not authenticated');
      }
      const userId = req.user.id;
      await this.likesService.addLike(postId, userId);
      return res.status(HttpStatus.CREATED).send();
    } catch (error) {
      console.error('Error in likePost:', error);
      throw error;  // Optionally rethrow or handle error as needed
    }
  }


  @Delete(':postId/like')
  @ApiOperation({ summary: 'Unlike a post' })
  @ApiParam({
    name: 'postId',
    type: String,
    description: 'ID of the post to unlike',
  })
  @ApiResponse({ status: 200, description: 'Post unliked successfully' })
  @ApiResponse({ status: 404, description: 'Post or user not found' })
  @ApiResponse({ status: 403, description: 'User has not liked this post' })
  async unlikePost(
    @Param('postId') postId: string,
    @Req() req: CustomRequest,
    @Res() res: Response,
  ) {
    const userId = req.user.id;
    await this.likesService.removeLike(postId, userId);
    return res.status(HttpStatus.OK).send();
  }

  @Get(':postId/likes')
  @ApiOperation({ summary: 'Get all likes for a post' })
  @ApiParam({ name: 'postId', type: String, description: 'ID of the post' })
  @ApiResponse({
    status: 200,
    description: 'List of user IDs who liked the post',
    type: LikeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async getLikes(@Param('postId') postId: string, @Res() res: Response) {
    const likes = await this.likesService.getLikes(postId);
    return res.status(HttpStatus.OK).json({ userIds: likes });
  }

  @Get(':postId/like/check')
  @ApiOperation({ summary: 'Check if the user has liked a post' })
  @ApiParam({ name: 'postId', type: String, description: 'ID of the post' })
  @ApiResponse({
    status: 200,
    description: 'Check result',
    type: CheckLikeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Post or user not found' })
  async checkLike(
    @Param('postId') postId: string,
    @Req() req: CustomRequest,
    @Res() res: Response,
  ) {
    const userId = req.user.id;
    const hasLiked = await this.likesService.hasLiked(postId, userId);
    return res.status(HttpStatus.OK).json({ hasLiked });
  }
}
