import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('idp')
export class Idp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  refId: string;

  @Column({ default: 'PENDING' })
  status: string;
  // Values: PENDING | SUPERVISOR_NOTIFIED | SUPERVISOR_REVIEWED | COMPLETE

  // ── Personnel / header ──────────────────────────────────────────────────
  @Column({ nullable: true }) campus: string;
  @Column({ nullable: true }) officeAffiliation: string;
  @Column({ nullable: true }) collegeOfficeUnit: string;
  @Column({ nullable: true }) collegeProgram: string;
  @Column({ nullable: true }) personnelType: string;
  @Column({ nullable: true }) nameOfPersonnel: string;
  @Column({ nullable: true }) lastName: string;
  @Column({ nullable: true }) firstName: string;
  @Column({ nullable: true }) middleInitial: string;
  @Column({ nullable: true }) employeeEmail: string;
  @Column({ nullable: true }) datePrepared: string;
  @Column({ nullable: true }) educAttainment: string;
  @Column({ nullable: true }) educAttainmentSpec: string;
  @Column({ nullable: true }) currentPosition: string;
  @Column({ nullable: true }) yearCovered: string;
  @Column({ nullable: true, type: 'float' }) yearsInPosition: number;
  @Column({ nullable: true, type: 'float' }) yearsInCSU: number;
  @Column({ nullable: true }) supervisorName: string;
  @Column({ nullable: true }) supervisorEmail: string;
  @Column({ nullable: true }) headerPurpose: string;
  @Column({ nullable: true }) competencyPurpose: string;

  // ── Section table rows (stored as JSON strings) ─────────────────────────
  @Column({ type: 'text', nullable: true }) competencyRowsJson: string;
  @Column({ type: 'text', nullable: true }) agapRowsJson: string;
  @Column({ type: 'text', nullable: true }) proactRowsJson: string;

  // ── Supervisor stage 2 fields ────────────────────────────────────────────
  @Column({ nullable: true }) supervisorRemarks: string;
  @Column({ nullable: true }) supervisorApproval: string;
  @Column({ nullable: true }) supervisorSignedAt: string;
  @Column({ type: 'text', nullable: true }) supervisorAssessment: string; // JSON

  @Column({ nullable: true, unique: true })
  supervisorToken: string; // UUID token sent in supervisor email link

  @Column({ nullable: true })
  supervisorNotifiedAt: string; // ISO timestamp when supervisor was emailed

  @CreateDateColumn()
  submittedAt: Date;
}
