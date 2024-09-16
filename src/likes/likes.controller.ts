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
  Body,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
import { LikesService } from './likes.service';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { CustomRequest } from 'custom-request.interface';
import { Roles } from 'src/auth/guard/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { CreateLikeDto } from './dto/create-like.dto';

@ApiTags('likes')
@Roles('admin', 'owner')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('posts')
export class LikesController {
  constructor(private readonly likesService: LikesService) { }

  @Post(':postId/like')
  @ApiOperation({ summary: 'Like a post' })
  @ApiParam({ name: 'postId', description: 'ID of the post to like' })
  @ApiBody({ type: CreateLikeDto })
  @ApiResponse({ status: 201, description: 'Post liked successfully' })
  @ApiResponse({ status: 404, description: 'Post or user not found' })
  async likePost(
    @Param('postId') postId: string,
    @Body() createLikeDto: CreateLikeDto,
    @Req() req: CustomRequest,
    @Res() res: Response,
  ) {
    if (!req.user?.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    try {
      await this.likesService.addLike(postId, createLikeDto.userId);
      return res.status(HttpStatus.CREATED).send();
    } catch (error) {
      console.error('Error adding like:', error.message);
      throw error;
    }
  }

  @Delete(':postId/like')
  @ApiOperation({ summary: 'Unlike a post' })
  @ApiParam({ name: 'postId', description: 'ID of the post to unlike' })
  @ApiResponse({ status: 200, description: 'Post unliked successfully' })
  async unlikePost(
    @Param('postId') postId: string,
    @Req() req: CustomRequest,
    @Res() res: Response,
  ) {
    if (!req.user?.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    try {
      await this.likesService.removeLike(postId, req.user.id);
      return res.status(HttpStatus.OK).send();
    } catch (error) {
      console.error('Error removing like:', error.message);
      throw error;
    }
  }

  @Get(':postId/likes')
  @ApiOperation({ summary: 'Get all likes for a post' })
  @ApiParam({ name: 'postId', description: 'ID of the post' })
  @ApiResponse({ status: 200, description: 'List of user IDs who liked the post' })
  async getLikes(@Param('postId') postId: string, @Res() res: Response) {
    try {
      const likes = await this.likesService.getLikes(postId);
      return res.status(HttpStatus.OK).json({ userIds: likes });
    } catch (error) {
      console.error('Error fetching likes:', error.message);
      throw error;
    }
  }

  @Get(':postId/like/check')
  @ApiOperation({ summary: 'Check if the user has liked a post' })
  @ApiParam({ name: 'postId', description: 'ID of the post' })
  @ApiResponse({ status: 200, description: 'Check result', type: Boolean })
  async checkLike(
    @Param('postId') postId: string,
    @Req() req: CustomRequest,
    @Res() res: Response,
  ) {
    if (!req.user?.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    try {
      const hasLiked = await this.likesService.hasLiked(postId, req.user.id);
      return res.status(HttpStatus.OK).json({ hasLiked });
    } catch (error) {
      console.error('Error checking like status:', error.message);
      throw error;
    }
  }
}
