import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { Request } from 'express';
import { User } from '../user/entities/user.entity'; // Import your User entity
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('comments')
@ApiBearerAuth() // Add this if you are using bearer token for authorization
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiResponse({
    status: 201,
    description: 'The comment has been successfully created.',
    type: Comment,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: Request,
  ): Promise<Comment> {
    const user = req.user as User; // Type assertion
    return this.commentsService.create(createCommentDto, user);
  }

  @Get(':postId')
  @ApiOperation({ summary: 'Retrieve all comments for a specific post' })
  @ApiResponse({
    status: 200,
    description: 'List of comments for the specified post',
    type: [Comment],
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async findAllForPost(@Param('postId') postId: string): Promise<Comment[]> {
    return this.commentsService.findAllForPost(postId);
  }

  @Get('comment/:id')
  @ApiOperation({ summary: 'Retrieve a single comment by ID' })
  @ApiResponse({
    status: 200,
    description: 'The requested comment',
    type: Comment,
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async findOne(@Param('id') id: string): Promise<Comment> {
    return this.commentsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing comment' })
  @ApiResponse({
    status: 200,
    description: 'The comment has been successfully updated.',
    type: Comment,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req: Request,
  ): Promise<Comment> {
    const user = req.user as User; // Type assertion
    const existingComment = await this.commentsService.findOne(id);
    if (existingComment.user.id !== user.id) {
      throw new ForbiddenException(
        'You are not allowed to update this comment',
      );
    }
    return this.commentsService.update(id, updateCommentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment by ID' })
  @ApiResponse({
    status: 200,
    description: 'The comment has been successfully deleted.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async remove(@Param('id') id: string, @Req() req: Request): Promise<void> {
    const user = req.user as User; // Type assertion
    const existingComment = await this.commentsService.findOne(id);
    if (existingComment.user.id !== user.id) {
      throw new ForbiddenException(
        'You are not allowed to delete this comment',
      );
    }
    return this.commentsService.remove(id);
  }
}
