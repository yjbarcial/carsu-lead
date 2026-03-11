import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Idp } from './idp.entity';
import { IdpService } from './idp.service';
import { IdpController } from './idp.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Idp])],
  controllers: [IdpController],
  providers: [IdpService],
  exports: [IdpService],
})
export class IdpModule {}
