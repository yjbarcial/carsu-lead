import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Idp } from './idp.entity';
import { MailService } from '../mail/mail.service';
import { PdfService } from '../pdf/pdf.service';

type EditCheckResult = Idp | 'not_found' | 'wrong_email' | 'locked';

@Injectable()
export class IdpService {
  constructor(
    @InjectRepository(Idp) private repo: Repository<Idp>,
    private readonly mail: MailService,
    private readonly pdf: PdfService,
    private readonly dataSource: DataSource,
  ) {}

  // ── Create (initial submission) ─────────────────────────────────────────

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
      designation: data.designation ?? '',
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

    const saved = (await this.repo.save(record)) as unknown as Idp;

    const employeeName = [data.firstName, data.lastName]
      .filter(Boolean)
      .join(' ');
    const frontendBase = process.env.FRONTEND_URL ?? 'http://localhost:3000';
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

      await this.repo.update(
        { refId: saved.refId },
        {
          supervisorNotifiedAt: new Date().toISOString(),
          status: 'SUPERVISOR_NOTIFIED',
        },
      );
    }

    return (
      (await this.repo.findOne({ where: { refId: saved.refId } })) ?? saved
    );
  }

  // ── Read ────────────────────────────────────────────────────────────────

  findAll(): Promise<Idp[]> {
    return this.repo.find({ order: { submittedAt: 'DESC' } });
  }

  findByRef(refId: string): Promise<Idp | null> {
    return this.repo.findOne({ where: { refId } });
  }

  findByToken(token: string): Promise<Idp | null> {
    return this.repo.findOne({ where: { supervisorToken: token } });
  }

  // ── Employee edit ───────────────────────────────────────────────────────

  /**
   * Verify identity and return record if editable.
   * Returns a string sentinel on failure so the controller can map to HTTP codes.
   */
  async getForEdit(refId: string, email: string): Promise<EditCheckResult> {
    const record = await this.repo.findOne({ where: { refId } });
    if (!record) return 'not_found';
    if (record.employeeEmail.toLowerCase() !== email.trim().toLowerCase())
      return 'wrong_email';
    if (record.status === 'COMPLETE') return 'locked';
    return record;
  }

  /**
   * Apply employee-submitted edits.
   * Re-notifies supervisor so they always review the latest version.
   */
  async updateByEmployee(
    refId: string,
    email: string,
    data: Record<string, any>,
  ): Promise<EditCheckResult> {
    const check = await this.getForEdit(refId, email);
    if (typeof check === 'string') return check; // sentinel — not_found / wrong_email / locked

    const record = check;

    await this.repo.update(
      { refId },
      {
        // All employee-editable header fields
        officeAffiliation: data.officeAffiliation ?? record.officeAffiliation,
        collegeOfficeUnit: data.collegeOfficeUnit ?? record.collegeOfficeUnit,
        collegeProgram: data.collegeProgram ?? record.collegeProgram,
        personnelType: data.personnelType ?? record.personnelType,
        nameOfPersonnel: data.nameOfPersonnel ?? record.nameOfPersonnel,
        lastName: data.lastName ?? record.lastName,
        firstName: data.firstName ?? record.firstName,
        middleInitial: data.middleInitial ?? record.middleInitial,
        datePrepared: data.datePrepared ?? record.datePrepared,
        educAttainment: data.educAttainment ?? record.educAttainment,
        educAttainmentSpec:
          data.educAttainmentSpec ?? record.educAttainmentSpec,
        currentPosition: data.currentPosition ?? record.currentPosition,
        designation: data.designation ?? record.designation,
        yearsInPosition: data.yearsInPosition ?? record.yearsInPosition,
        yearsInCSU: data.yearsInCSU ?? record.yearsInCSU,
        supervisorName: data.supervisorName ?? record.supervisorName,
        supervisorEmail: data.supervisorEmail ?? record.supervisorEmail,
        headerPurpose: data.headerPurpose ?? record.headerPurpose,
        competencyPurpose: data.competencyPurpose ?? record.competencyPurpose,
        // Section rows
        competencyRowsJson: JSON.stringify(data.competencyRows ?? []),
        agapRowsJson: JSON.stringify(data.agapRows ?? []),
        proactRowsJson: JSON.stringify(data.proactRows ?? []),
        // Stamp edit time
        supervisorNotifiedAt: new Date().toISOString(),
      },
    );

    const updated = await this.repo.findOne({ where: { refId } });
    if (!updated) return 'not_found';

    const employeeName =
      [updated.firstName, updated.lastName].filter(Boolean).join(' ') ||
      updated.nameOfPersonnel ||
      '';

    const frontendBase = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const reviewUrl = `${frontendBase}/idp-supervisor?token=${updated.supervisorToken}`;

    // 1. Confirm edit to employee
    if (updated.employeeEmail) {
      this.mail.sendEmployeeEditConfirmation({
        to: updated.employeeEmail,
        name: employeeName,
        refId: updated.refId,
        supervisorName: updated.supervisorName,
      });
    }

    // 2. Re-notify supervisor with updated content
    if (updated.supervisorEmail) {
      this.mail.sendSupervisorRenotification({
        to: updated.supervisorEmail,
        supervisorName: updated.supervisorName,
        employeeName,
        refId: updated.refId,
        position: updated.currentPosition,
        officeUnit: updated.collegeOfficeUnit,
        reviewUrl,
      });
    }

    return updated;
  }

  // ── Supervisor review ───────────────────────────────────────────────────

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

    try {
      const pdfBuffer = await this.pdf.generateIdpPdf({ ...updated } as any);

      if (updated.employeeEmail) {
        this.mail.sendEmployeeCompletion({
          to: updated.employeeEmail,
          name: employeeName,
          refId: updated.refId,
          supervisorName: updated.supervisorName,
          pdfBuffer,
        });
      }

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

  // ── PDF ─────────────────────────────────────────────────────────────────

  async generatePdf(refId: string): Promise<Buffer | null> {
    const record = await this.repo.findOne({ where: { refId } });
    if (!record) return null;
    try {
      return await this.pdf.generateIdpPdf({ ...record } as any);
    } catch (err) {
      console.error('PDF generation failed:', err.message);
      return null;
    }
  }

  // ── Shared autocomplete suggestions (HEI & Pro-ACT) ─────────────────────

  async getSuggestions(type: string): Promise<string[]> {
    const rows = await this.dataSource.query(
      `SELECT value FROM idp_suggestions WHERE type = $1 ORDER BY value ASC`,
      [type],
    );
    return rows.map((r: { value: string }) => r.value);
  }

  async saveSuggestion(type: string, value: string): Promise<void> {
    if (!value || !value.trim()) return;
    await this.dataSource.query(
      `INSERT INTO idp_suggestions (type, value)
       VALUES ($1, $2)
       ON CONFLICT (value) DO NOTHING`,
      [type, value.trim()],
    );
  }
}
