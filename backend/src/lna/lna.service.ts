import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lna } from './lna.entity';

@Injectable()
export class LnaService {
  constructor(@InjectRepository(Lna) private repo: Repository<Lna>) {}

  async create(data: Partial<Lna>): Promise<Lna> {
    const refId = 'LNA-' + Date.now();
    const record = this.repo.create({ ...data, refId });
    return this.repo.save(record);
  }

  findAll(): Promise<Lna[]> {
    return this.repo.find({ order: { submittedAt: 'DESC' } });
  }
}
