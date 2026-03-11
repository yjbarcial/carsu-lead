import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HrUser } from '../users/hr-user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HrUser])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
