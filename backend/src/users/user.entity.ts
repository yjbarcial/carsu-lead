import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string; // null if Google OAuth only

  @Column({ nullable: true, unique: true })
  googleId: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ default: false })
  profileComplete: boolean;

  // ── Profile fields (from IDP Personnel Info) ──────────────────────
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

  // ── Profile fields (from LNA Office Info) ─────────────────────────
  @Column({ nullable: true }) office: string;
  @Column({ nullable: true }) headOfUnit: string;
  @Column({ nullable: true }) raterName: string;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
