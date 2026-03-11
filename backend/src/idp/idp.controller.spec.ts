import { Test, TestingModule } from '@nestjs/testing';
import { IdpController } from './idp.controller';

describe('IdpController', () => {
  let controller: IdpController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IdpController],
    }).compile();

    controller = module.get<IdpController>(IdpController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
