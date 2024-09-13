import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) { }

  async create(user: User, createPostDto: CreatePostDto): Promise<Post> {
    const post = this.postsRepository.create({
      user,
      ...createPostDto,
    });
    return this.postsRepository.save(post);
  }

  async findAll(): Promise<Post[]> {
    return this.postsRepository.find({ relations: ['user'] });
  }

  async findOne(id: string): Promise<Post> {
    return this.postsRepository.findOne({ where: { id }, relations: ['user'] });
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    await this.postsRepository.update(id, updatePostDto);
    return this.postsRepository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.postsRepository.delete(id);
  }
}
