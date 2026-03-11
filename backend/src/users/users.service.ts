import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HrUser } from './hr-user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(HrUser) private repo: Repository<HrUser>) {}

  findAll(): Promise<HrUser[]> { return this.repo.find(); }

  create(data: Partial<HrUser>): Promise<HrUser> {
    return this.repo.save(this.repo.create(data));
  }

  async remove(email: string) {
    await this.repo.delete({ email });
    return { deleted: email };
  }
}
