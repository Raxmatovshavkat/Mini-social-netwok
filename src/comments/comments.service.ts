import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { User } from '../user/entities/user.entity';
import { Post } from '../posts/entities/post.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) { }

  async create(
    createCommentDto: CreateCommentDto,
    user: User,
  ): Promise<Comment> {
    const comment = this.commentsRepository.create({
      ...createCommentDto,
      user,
      post: { id: createCommentDto.postId } as Post,
    });
    return this.commentsRepository.save(comment);
  }

  async findAllForPost(postId: string): Promise<Comment[]> {
    const whereCondition: FindOptionsWhere<Comment> = {
      post: { id: postId } as Post,
    };

    return this.commentsRepository.find({
      where: whereCondition,
      relations: ['user'],
    });
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    return comment;
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    const comment = await this.findOne(id);
    Object.assign(comment, updateCommentDto);
    return this.commentsRepository.save(comment);
  }

  async remove(id: string): Promise<void> {
    const comment = await this.findOne(id);
    await this.commentsRepository.remove(comment);
  }
}
