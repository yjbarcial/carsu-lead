import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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
    private readonly dataSource: DataSource,
  ) {}

  // ── RefId generation ─────────────────────────────────────────────────────

  private async generateRefId(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `LNA-${year}-`;

    // Find the latest record for this year by sorting DESC on refId
    const last = await this.repo
      .createQueryBuilder('lna')
      .where('lna."refId" LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('lna."refId"', 'DESC')
      .getOne();

    let nextNum = 1;
    if (last) {
      const parts = last.refId.split('-');
      const lastNum = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNum)) nextNum = lastNum + 1;
    }

    // Zero-pad to 4 digits: LNA-2026-0001
    return `${prefix}${String(nextNum).padStart(4, '0')}`;
  }

  // ── Create ───────────────────────────────────────────────────────────────

  async create(data: Partial<Lna>): Promise<Lna> {
    const refId = await this.generateRefId();
    const record = this.repo.create({
      ...data,
      refId,
      raterName: (data as any).raterFullName ?? (data as any).raterName ?? null,
    });
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
