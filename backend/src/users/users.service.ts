import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async updateProfile(id: string, data: Partial<User>) {
    await this.repo.update(id, { ...data, profileComplete: true });
    return this.repo.findOne({ where: { id } });
  }

  // Still needed for admin HR user management
  findAll() {
    return this.repo.find();
  }

  async grantHrStaffRole(userId: string) {
    await this.repo.update(userId, { role: 'hr-staff' });
    return this.repo.findOne({ where: { id: userId } });
  }

  async revokeHrStaffRole(userId: string) {
    await this.repo.update(userId, { role: 'user' });
    return this.repo.findOne({ where: { id: userId } });
  }
}
