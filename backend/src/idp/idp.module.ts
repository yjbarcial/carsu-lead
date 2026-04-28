import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Idp } from './idp.entity';
import { IdpService } from './idp.service';
import { IdpController } from './idp.controller';
import { MailModule } from '../mail/mail.module';
import { PdfModule } from '../pdf/pdf.module';
import { IdpSuggestion } from './idp-suggestion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Idp, IdpSuggestion]),
    MailModule,
    PdfModule,
  ],
  controllers: [IdpController],
  providers: [IdpService],
})
export class IdpModule {}
