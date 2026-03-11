import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HrUser } from '../users/hr-user.entity';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(HrUser) private repo: Repository<HrUser>) {}

  async checkAccess(email: string) {
    const user = await this.repo.findOne({ where: { email: email.toLowerCase() } });
    if (!user) return { authorized: false, message: 'Email not in HR registry.' };
    return { authorized: true, name: user.name };
  }
}
