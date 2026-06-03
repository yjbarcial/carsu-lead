import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { User, UserRole } from '../users/user.entity';
import { RefreshToken } from './refresh-token.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(RefreshToken) private tokenRepo: Repository<RefreshToken>,
    private jwt: JwtService,
    private cfg: ConfigService,
  ) {}

  // ── Register (email/password) ──────────────────────────────────────
  async register(email: string, password: string) {
    if (!email.endsWith('@carsu.edu.ph')) {
      throw new BadRequestException('Only @carsu.edu.ph emails are allowed.');
    }
    const exists = await this.userRepo.findOne({ where: { email } });
    if (exists) throw new ConflictException('Email already registered.');

    const hashed = await bcrypt.hash(password, 12);
    const user = this.userRepo.create({ email, password: hashed });
    await this.userRepo.save(user);
    return this.issueTokens(user);
  }

  // ── Login (email/password) ─────────────────────────────────────────
  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !user.password)
      throw new UnauthorizedException('Invalid credentials.');
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials.');
    return this.issueTokens(user);
  }

  // ── Refresh token ──────────────────────────────────────────────────
  async refresh(token: string) {
    const stored = await this.tokenRepo.findOne({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
    const user = await this.userRepo.findOne({ where: { id: stored.userId } });
    if (!user) throw new UnauthorizedException();
    await this.tokenRepo.delete({ id: stored.id });
    return this.issueTokens(user);
  }

  // ── Logout ─────────────────────────────────────────────────────────
  async logout(token: string) {
    await this.tokenRepo.delete({ token });
    return { success: true };
  }

  // ── Internal: issue access + refresh tokens ────────────────────────
  private async issueTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });

    const refreshToken = uuid();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.tokenRepo.save(
      this.tokenRepo.create({
        token: refreshToken,
        userId: user.id,
        expiresAt,
      }),
    );

    return {
      accessToken,
      refreshToken,
      profileComplete: user.profileComplete,
      role: user.role,
    };
  }
}
