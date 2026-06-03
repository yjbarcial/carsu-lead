import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('idp')
export class Idp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  refId: string;

  @Column({ default: 'PENDING' })
  status: string;

  // ── FK to user (replaces all personnel fields) ───────────────────
  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  // ── Fields that remain submission-specific ───────────────────────
  @Column({ nullable: true }) supervisorName: string;
  @Column({ nullable: true }) supervisorEmail: string;
  @Column({ nullable: true }) headerPurpose: string;
  @Column({ nullable: true }) competencyPurpose: string;

  @Column({ type: 'text', nullable: true }) competencyRowsJson: string;
  @Column({ type: 'text', nullable: true }) agapRowsJson: string;
  @Column({ type: 'text', nullable: true }) proactRowsJson: string;

  @Column({ nullable: true }) supervisorRemarks: string;
  @Column({ nullable: true }) supervisorApproval: string;
  @Column({ nullable: true }) supervisorSignedAt: string;
  @Column({ type: 'text', nullable: true }) supervisorAssessment: string;

  @Column({ nullable: true, unique: true })
  supervisorToken: string;

  @Column({ nullable: true })
  supervisorNotifiedAt: string;

  @CreateDateColumn()
  submittedAt: Date;
}
