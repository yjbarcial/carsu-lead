import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  HR_STAFF = 'hr-staff',
  USER = 'user',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ default: false })
  profileComplete: boolean;

  // ── From IDP Personnel Info ───────────────────────────────────────
  @Column({ nullable: true }) firstName: string;
  @Column({ nullable: true }) lastName: string;
  @Column({ nullable: true }) middleInitial: string;
  @Column({ nullable: true }) campus: string;
  @Column({ nullable: true }) officeAffiliation: string;
  @Column({ nullable: true }) collegeOfficeUnit: string;
  @Column({ nullable: true }) collegeProgram: string;
  @Column({ nullable: true }) personnelType: string;
  @Column({ nullable: true }) educAttainment: string;
  @Column({ nullable: true }) educAttainmentSpec: string;
  @Column({ nullable: true }) currentPosition: string;
  @Column({ nullable: true }) designation: string;
  @Column({ nullable: true, type: 'float' }) yearsInPosition: number;
  @Column({ nullable: true, type: 'float' }) yearsInCSU: number;
  @Column({ nullable: true }) supervisorLastName: string;
  @Column({ nullable: true }) supervisorFirstName: string;
  @Column({ nullable: true }) supervisorMiddleInitial: string;
  @Column({ nullable: true }) supervisorEmail: string;

  // ── From LNA Office Info ──────────────────────────────────────────
  @Column({ nullable: true }) office: string;
  @Column({ nullable: true }) headOfUnit: string; // full name string (legacy/display)
  @Column({ nullable: true }) headLastName: string;
  @Column({ nullable: true }) headFirstName: string;
  @Column({ nullable: true }) headMiddleInitial: string;
  @Column({ nullable: true }) raterName: string;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
