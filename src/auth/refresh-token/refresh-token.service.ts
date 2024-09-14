import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
  ) {}

  async storeRefreshToken(token: any, user: User) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    console.log('Storing refresh token with expiry date:', expiryDate);

    const refreshToken = this.refreshTokenRepository.create({
      token,
      user,
      expiryDate,
    });
    const savedToken = await this.refreshTokenRepository.save(refreshToken);
    // console.log('Saved refresh token:', savedToken);
    return savedToken;
  }

  async findOne(criteria: any): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findOne({
      where: criteria.where,
      relations: criteria.relations,
    });
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token must be provided');
    }

    const tokenData = await this.findOne({
      where: { token: refreshToken },
      relations: ['user'],
    });

    if (!tokenData) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    try {
      this.jwtService.verify(refreshToken, {
        secret: process.env.DATABASE_REFRESH_TOKEN_SECRET,
      });

      const newAccessToken = this.jwtService.sign(
        { sub: tokenData.user.id, email: tokenData.user.email },
        {
          secret: process.env.DATABASE_ACCESS_TOKEN_SECRET,
          expiresIn: process.env.ACCESS_EXPIRES_IN || '1h',
        },
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      console.error(`Error in refreshAccessToken: ${error.message}`);
      throw new UnauthorizedException('Failed to refresh access token');
    }
  }

  async removeTokensForUser(userId: string): Promise<void> {
    await this.refreshTokenRepository.delete({ user: { id: userId } });
  }
}
