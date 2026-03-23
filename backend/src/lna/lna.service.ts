import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lna } from './lna.entity';
import { MailService } from '../mail/mail.service';
import { PdfService } from '../pdf/pdf.service';

@Injectable()
export class LnaService {
  private readonly logger = new Logger(LnaService.name);

  constructor(
    @InjectRepository(Lna) private repo: Repository<Lna>,
    private readonly mail: MailService,
    private readonly pdf: PdfService,
  ) {}

  async create(data: Partial<Lna>): Promise<Lna> {
    const refId = 'LNA-' + Date.now();
    const record = this.repo.create({ ...data, refId });
    const saved = await this.repo.save(record);

    const submittedAt = new Date().toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Generate PDF and send emails (non-blocking — errors logged, not thrown)
    try {
      const pdfBuffer = await this.pdf.generateLnaPdf({ ...saved } as any);

      // 1. Email to HR with PDF
      this.mail.sendLnaHrNotification({
        refId: saved.refId,
        office: saved.office ?? saved.officeAffiliation ?? '',
        headOfUnit: saved.headOfUnit ?? '',
        submitterEmail: saved.submitterEmail ?? '',
        submittedAt,
        pdfBuffer,
      });

      // 2. Email to the submitter/head of office with PDF
      if (saved.submitterEmail) {
        this.mail.sendLnaSubmitterConfirmation({
          to: saved.submitterEmail,
          headOfUnit: saved.headOfUnit ?? '',
          refId: saved.refId,
          office: saved.office ?? saved.officeAffiliation ?? '',
          submittedAt,
          pdfBuffer,
        });
      }
    } catch (err) {
      this.logger.error(`LNA post-save email/PDF failed: ${err.message}`);
    }

    return saved;
  }

  findAll(): Promise<Lna[]> {
    return this.repo.find({ order: { submittedAt: 'DESC' } });
  }

  async generatePdf(refId: string): Promise<Buffer | null> {
    const record = await this.repo.findOne({ where: { refId } });
    if (!record) return null;
    try {
      return await this.pdf.generateLnaPdf({ ...record } as any);
    } catch (err) {
      this.logger.error(`PDF generation failed for ${refId}: ${err.message}`);
      return null;
    }
  }
}
