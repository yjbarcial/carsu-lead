import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Idp } from './idp.entity';

@Injectable()
export class IdpService {
  constructor(@InjectRepository(Idp) private repo: Repository<Idp>) {}

  async create(data: Partial<Idp>): Promise<Idp> {
    const refId = 'IDP-' + Date.now();
    const record = this.repo.create({ ...data, refId, status: 'PENDING' });
    return this.repo.save(record);
  }

  findAll(): Promise<Idp[]> {
    return this.repo.find({ order: { submittedAt: 'DESC' } });
  }

  findByRef(refId: string): Promise<Idp | null> {
    return this.repo.findOne({ where: { refId } });
  }

  async updateSupervisor(refId: string, data: Partial<Idp>): Promise<Idp | null> {
  await this.repo.update({ refId }, { ...data, status: 'COMPLETE' });
  return this.repo.findOne({ where: { refId } });
  }
}
