import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    try {
      const [post, user] = await Promise.all([
        this.postRepository.findOneOrFail({ where: { id: postId } }),
        this.userRepository.findOneOrFail({ where: { id: userId } }),
      ]);

      const existingLike = await this.likeRepository.findOne({
        where: { post: { id: postId }, user: { id: userId } },
      });
      if (existingLike) {
        throw new ConflictException('Like already exists');
      }

      const like = this.likeRepository.create({ post, user });
      await this.likeRepository.save(like);
    } catch (error) {
      console.error('Error in addLike:', error.message);
      throw error;
    }
  }

  async removeLike(postId: string, userId: string): Promise<void> {
    try {
      const like = await this.likeRepository.findOneOrFail({
        where: { post: { id: postId }, user: { id: userId } },
      });

      await this.likeRepository.remove(like);
    } catch (error) {
      console.error('Error in removeLike:', error.message);
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Like not found');
      }
      throw error;
    }
  }

  async getLikes(postId: string): Promise<string[]> {
    try {
      const likes = await this.likeRepository.find({
        where: { post: { id: postId } },
        relations: ['user'],
      });

      return likes.map(like => like.user.id);
    } catch (error) {
      console.error('Error in getLikes:', error.message);
      throw error;
    }
  }

  async hasLiked(postId: string, userId: string): Promise<boolean> {
    try {
      const like = await this.likeRepository.findOne({
        where: { post: { id: postId }, user: { id: userId } },
      });

      return !!like;
    } catch (error) {
      console.error('Error in hasLiked:', error.message);
      throw error;
    }
  }
}
