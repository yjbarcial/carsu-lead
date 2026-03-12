import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Idp } from './idp.entity';
import { MailService } from '../mail/mail.service';
import { PdfService } from '../pdf/pdf.service';

@Injectable()
export class IdpService {
  constructor(
    @InjectRepository(Idp) private repo: Repository<Idp>,
    private readonly mail: MailService,
    private readonly pdf: PdfService,
  ) {}

  async create(data: Record<string, any>): Promise<Idp> {
    const refId = 'IDP-' + Date.now();

    const record = this.repo.create({
      refId,
      status: 'PENDING',
      campus: data.campus ?? 'CSU Main Campus',
      officeAffiliation: data.officeAffiliation ?? '',
      collegeOfficeUnit: data.collegeOfficeUnit ?? '',
      collegeProgram: data.collegeProgram ?? '',
      personnelType: data.personnelType ?? '',
      nameOfPersonnel: data.nameOfPersonnel ?? '',
      lastName: data.lastName ?? '',
      firstName: data.firstName ?? '',
      middleInitial: data.middleInitial ?? '',
      employeeEmail: data.employeeEmail ?? '',
      datePrepared: data.datePrepared ?? '',
      educAttainment: data.educAttainment ?? '',
      educAttainmentSpec: data.educAttainmentSpec ?? '',
      currentPosition: data.currentPosition ?? '',
      yearCovered: data.yearCovered ?? '',
      yearsInPosition: data.yearsInPosition ?? 0,
      yearsInCSU: data.yearsInCSU ?? 0,
      supervisorName: data.supervisorName ?? '',
      supervisorEmail: data.supervisorEmail ?? '',
      headerPurpose: data.headerPurpose ?? '',
      competencyPurpose: data.competencyPurpose ?? '',
      competencyRowsJson: JSON.stringify(data.competencyRows ?? []),
      agapRowsJson: JSON.stringify(data.agapRows ?? []),
      proactRowsJson: JSON.stringify(data.proactRows ?? []),
    });

    const saved = await this.repo.save(record);

    // ── Send emails (non-blocking — errors are logged, not thrown) ──────────
    const employeeName = [data.firstName, data.lastName]
      .filter(Boolean)
      .join(' ');
    const frontendBase = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const reviewUrl = `${frontendBase}/idp-supervisor?ref=${saved.refId}`;

    if (saved.employeeEmail) {
      this.mail.sendEmployeeConfirmation({
        to: saved.employeeEmail,
        name: employeeName || saved.nameOfPersonnel,
        refId: saved.refId,
        supervisorName: saved.supervisorName,
      });
    }

    if (saved.supervisorEmail) {
      this.mail.sendSupervisorNotification({
        to: saved.supervisorEmail,
        supervisorName: saved.supervisorName,
        employeeName: employeeName || saved.nameOfPersonnel,
        refId: saved.refId,
        position: saved.currentPosition,
        officeUnit: saved.collegeOfficeUnit,
        reviewUrl,
      });
    }

    return saved;
  }

  findAll(): Promise<Idp[]> {
    return this.repo.find({ order: { submittedAt: 'DESC' } });
  }

  findByRef(refId: string): Promise<Idp | null> {
    return this.repo.findOne({ where: { refId } });
  }

  async updateSupervisor(
    refId: string,
    data: Partial<Idp>,
  ): Promise<Idp | null> {
    await this.repo.update({ refId }, { ...data, status: 'COMPLETE' });
    const updated = await this.repo.findOne({ where: { refId } });
    if (!updated) return null;

    const employeeName =
      [updated.firstName, updated.lastName].filter(Boolean).join(' ') ||
      updated.nameOfPersonnel ||
      '';
    const completedAt = new Date().toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // 1. Send completion email to employee
    if (updated.employeeEmail) {
      this.mail.sendEmployeeCompletion({
        to: updated.employeeEmail,
        name: employeeName,
        refId: updated.refId,
        supervisorName: updated.supervisorName,
      });
    }

    // 2. Generate PDF and send to HR
    try {
      const pdfBuffer = await this.pdf.generateIdpPdf({ ...updated } as any);
      this.mail.sendHrNotification({
        employeeName,
        refId: updated.refId,
        position: updated.currentPosition,
        officeUnit: updated.collegeOfficeUnit,
        supervisorName: updated.supervisorName,
        completedAt,
        pdfBuffer,
      });
    } catch (err) {
      console.error('PDF generation failed:', err.message);
    }

    return updated;
  }
}
