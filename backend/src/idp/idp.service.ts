import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
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
    const supervisorToken = uuidv4();

    const record = this.repo.create({
      refId,
      supervisorToken,
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

    const employeeName = [data.firstName, data.lastName]
      .filter(Boolean)
      .join(' ');
    const frontendBase = process.env.FRONTEND_URL ?? 'http://localhost:3000';

    // Use token in supervisor review URL (not refId — token is unguessable)
    const reviewUrl = `${frontendBase}/idp-supervisor?token=${saved.supervisorToken}`;

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

      // Stamp notification timestamp and advance status
      await this.repo.update(
        { refId: saved.refId },
        {
          supervisorNotifiedAt: new Date().toISOString(),
          status: 'SUPERVISOR_NOTIFIED',
        },
      );
    }

    // Return the latest state
    return (
      (await this.repo.findOne({ where: { refId: saved.refId } })) ?? saved
    );
  }

  findAll(): Promise<Idp[]> {
    return this.repo.find({ order: { submittedAt: 'DESC' } });
  }

  findByRef(refId: string): Promise<Idp | null> {
    return this.repo.findOne({ where: { refId } });
  }

  findByToken(token: string): Promise<Idp | null> {
    return this.repo.findOne({ where: { supervisorToken: token } });
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

    // Generate PDF once — attach to both employee and HR emails
    try {
      const pdfBuffer = await this.pdf.generateIdpPdf({ ...updated } as any);

      // 1. Send completion email to employee (with PDF)
      if (updated.employeeEmail) {
        this.mail.sendEmployeeCompletion({
          to: updated.employeeEmail,
          name: employeeName,
          refId: updated.refId,
          supervisorName: updated.supervisorName,
          pdfBuffer,
        });
      }

      // 2. Send HR notification (with PDF)
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

  async updateSupervisorByToken(
    token: string,
    data: Partial<Idp>,
  ): Promise<Idp | null> {
    const record = await this.repo.findOne({
      where: { supervisorToken: token },
    });
    if (!record) return null;
    return this.updateSupervisor(record.refId, data);
  }
}
