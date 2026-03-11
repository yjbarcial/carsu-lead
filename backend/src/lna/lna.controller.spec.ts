import { Test, TestingModule } from '@nestjs/testing';
import { LnaController } from './lna.controller';

describe('LnaController', () => {
  let controller: LnaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LnaController],
    }).compile();

    controller = module.get<LnaController>(LnaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
