import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lna } from './lna.entity';
import { LnaService } from './lna.service';
import { LnaController } from './lna.controller';
import { MailModule } from '../mail/mail.module';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lna]), MailModule, PdfModule],
  controllers: [LnaController],
  providers: [LnaService],
  exports: [LnaService],
})
export class LnaModule {}
