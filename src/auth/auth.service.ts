import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entity';
import { RefreshTokenService } from './refresh-token/refresh-token.service';
import { OtpService } from './otp/otp.service';
import { RegisterDto } from './dto/user-register.dto';
import { LoginDto } from './dto/user-login.dto';
import * as bcrypt from 'bcrypt';
import * as otpGenerator from 'otp-generator';
import { EmailService } from './mail/mail.service';
import { UserService } from 'src/user/user.service';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class AuthService {
  private readonly accessTokenSecret = process.env.DATABASE_ACCESS_TOKEN_SECRET;
  private readonly refreshTokenSecret = process.env.DATABASE_REFRESH_TOKEN_SECRET;
  private readonly accessTokenExpiresIn = process.env.ACCESS_EXPIRES_IN || '1h';
  private readonly refreshTokenExpiresIn = process.env.REFRESH_EXPIRES_IN || '7d';

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly refreshService: RefreshTokenService,
    private readonly otpService: OtpService,
    private readonly emailService: EmailService,
  ) { }

  async register(createUserDto: RegisterDto): Promise<User> {
    const { full_name, email, password } = createUserDto;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = { ...createUserDto, password: hashedPassword };
      const user = await this.userService.create(newUser);

      const otp = otpGenerator.generate(6, {
        digits: true,
        alphabets: false,
        upperCase: false,
        specialChars: false,
      });

      await this.emailService.sendEmail(email, otp);
      await this.otpService.saveOtp({ userId: user.id, otp });

      return user;
    } catch (error) {
      console.error('Registration error:', error.message);
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  async verify(userId: string, otp: string): Promise<void> {
    try {
      await this.otpService.verifyOtp(userId, otp);
      await this.userService.update(userId, { status: 'active' });
    } catch (error) {
      console.error(`OTP verification failed: ${error.message}`);
      throw new UnauthorizedException('Invalid OTP');
    }
  }

  async signIn(createLoginDto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const user = await this.userService.signin(createLoginDto);

      const payload = { sub: user.id.toString(), email: user.email, role: user.role };

      const accessToken = this.jwtService.sign(payload, {
        secret: this.accessTokenSecret,
        expiresIn: this.accessTokenExpiresIn,
      });

      const refreshToken = this.jwtService.sign(payload, {
        secret: this.refreshTokenSecret,
        expiresIn: this.refreshTokenExpiresIn,
      });

      await this.refreshService.storeRefreshToken(refreshToken, user);

      return { accessToken, refreshToken };
    } catch (error) {
      console.error(`Sign-in failed: ${error.message}`);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token must be provided');
    }

    const tokenData = await this.refreshService.findOne({
      where: { token: refreshToken },
      relations: ['user'],
    });

    if (!tokenData) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    try {
      this.jwtService.verify(refreshToken, {
        secret: this.refreshTokenSecret,
      });

      const newAccessToken = this.jwtService.sign(
        { sub: tokenData.user.id, email: tokenData.user.email },
        {
          secret: this.accessTokenSecret,
          expiresIn: this.accessTokenExpiresIn,
        },
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      console.error(`Error in refreshAccessToken: ${error.message}`);
      throw new UnauthorizedException('Failed to refresh access token');
    }
  }

  async me(id: string): Promise<User> {
    try {
      return await this.userService.findOne(id);
    } catch (error) {
      console.error(`Fetching user failed: ${error.message}`);
      throw new UnauthorizedException('User not found');
    }
  }

  async logout(userId: string): Promise<void> {
    try {
      await this.refreshService.removeTokensForUser(userId);
    } catch (error) {
      console.error(`Logout failed: ${error.message}`);
      throw new InternalServerErrorException('Failed to logout');
    }
  }
}
