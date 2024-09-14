import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  Get,
  Patch,
  Req,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity'; // Import User entity
import { Request } from 'express'; // Import Express Request type

@ApiTags('posts')
@ApiBearerAuth() // Add this if you are using bearer token for authorization
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({
    status: 201,
    description: 'The post has been successfully created.',
    type: CreatePostDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(
    @Body() createPostDto: CreatePostDto,
    @Req() req: Request, // Include this to extract user from request
  ) {
    const user = req.user as User; // Type assertion
    return this.postsService.create(user, createPostDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all posts' })
  @ApiResponse({
    status: 200,
    description: 'List of all posts',
    type: [CreatePostDto],
  })
  async findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single post by ID' })
  @ApiResponse({
    status: 200,
    description: 'The requested post',
    type: CreatePostDto,
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing post' })
  @ApiResponse({
    status: 200,
    description: 'The post has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post by ID' })
  @ApiResponse({
    status: 200,
    description: 'The post has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async remove(@Param('id') id: string) {
    return this.postsService.delete(id);
  }
}
