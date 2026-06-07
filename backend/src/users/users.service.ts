import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';

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

  findAll() {
    return this.repo.find();
  }

  async grantHrStaffRole(userId: string) {
    await this.repo.update(userId, { role: UserRole.HR_STAFF });
    return this.repo.findOne({ where: { id: userId } });
  }

  async revokeHrStaffRole(userId: string) {
    await this.repo.update(userId, { role: UserRole.USER });
    return this.repo.findOne({ where: { id: userId } });
  }

  async grantSupervisor(userId: string) {
    await this.repo.update(userId, { isSupervisor: true });
    return this.repo.findOne({ where: { id: userId } });
  }

  async revokeSupervisor(userId: string) {
    await this.repo.update(userId, { isSupervisor: false });
    return this.repo.findOne({ where: { id: userId } });
  }

  async setRole(userId: string, role: UserRole) {
    await this.repo.update(userId, { role });
    return this.repo.findOne({ where: { id: userId } });
  }
}
