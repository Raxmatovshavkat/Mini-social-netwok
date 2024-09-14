import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { Post } from 'src/posts/entities/post.entity';
import { User } from 'src/user/entities/user.entity';


@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async addLike(postId: string, userId: string): Promise<void> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingLike = await this.likeRepository.findOne({
      where: { post, user },
    });
    if (existingLike) {
      throw new ForbiddenException('User has already liked this post');
    }

    const like = this.likeRepository.create({ post, user });
    await this.likeRepository.save(like);
  }

  async removeLike(postId: string, userId: string): Promise<void> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const like = await this.likeRepository.findOne({ where: { post, user } });
    if (!like) {
      throw new NotFoundException('Like not found');
    }

    await this.likeRepository.remove(like);
  }

  async getLikes(postId: string): Promise<string[]> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['likes'],
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post.likes.map((like) => like.user.id);
  }

  async hasLiked(postId: string, userId: string): Promise<boolean> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const like = await this.likeRepository.findOne({ where: { post, user } });
    return !!like;
  }
}

