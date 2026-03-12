import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Idp } from './idp.entity';
import { IdpService } from './idp.service';
import { IdpController } from './idp.controller';
import { MailModule } from '../mail/mail.module';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [TypeOrmModule.forFeature([Idp]), MailModule, PdfModule],
  controllers: [IdpController],
  providers: [IdpService],
})
export class IdpModule {}
