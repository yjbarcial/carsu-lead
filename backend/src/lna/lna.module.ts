import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lna } from './lna.entity';
import { LnaService } from './lna.service';
import { LnaController } from './lna.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Lna])],
  controllers: [LnaController],
  providers: [LnaService],
  exports: [LnaService],
})
export class LnaModule {}
