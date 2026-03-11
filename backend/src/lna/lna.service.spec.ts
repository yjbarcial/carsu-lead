import { Test, TestingModule } from '@nestjs/testing';
import { LnaService } from './lna.service';

describe('LnaService', () => {
  let service: LnaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LnaService],
    }).compile();

    service = module.get<LnaService>(LnaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
