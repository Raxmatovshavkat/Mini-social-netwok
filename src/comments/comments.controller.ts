import { Controller, Post, Get, Put, Delete, Param, Body, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';

import { Request } from 'express';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

  @Post()
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: Request
  ): Promise<Comment> {
    const user = req.user; // Assuming user is attached to the request by the JWT guard
    return this.commentsService.create(createCommentDto, user);
  }

  @Get(':postId')
  async findAllForPost(@Param('postId') postId: string): Promise<Comment[]> {
    return this.commentsService.findAllForPost(postId);
  }

  @Get('comment/:id')
  async findOne(@Param('id') id: string): Promise<Comment> {
    return this.commentsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req: Request
  ): Promise<Comment> {
    const user = req.user; // Assuming user is attached to the request by the JWT guard
    const existingComment = await this.commentsService.findOne(id);
    if (existingComment.user.id !== user.id) {
      // Check if the user is the owner of the comment
      throw new ForbiddenException('You are not allowed to update this comment');
    }
    return this.commentsService.update(id, updateCommentDto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: Request
  ): Promise<void> {
    const user = req.user; // Assuming user is attached to the request by the JWT guard
    const existingComment = await this.commentsService.findOne(id);
    if (existingComment.user.id !== user.id) {
      // Check if the user is the owner of the comment
      throw new ForbiddenException('You are not allowed to delete this comment');
    }
    return this.commentsService.remove(id);
  }
}
