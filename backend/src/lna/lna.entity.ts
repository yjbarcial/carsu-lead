import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('lna_submissions')
export class Lna {
  @PrimaryGeneratedColumn() id: number;
  @Column({ unique: true }) refId: string;
  @Column() submitterEmail: string;
  @Column({ nullable: true }) campus: string;
  @Column({ nullable: true }) officeAffiliation: string;
  @Column({ nullable: true }) office: string;
  @Column({ nullable: true }) collegeProgram: string;
  @Column({ nullable: true }) headOfUnit: string;
  @Column({ nullable: true }) position: string;
  @Column({ nullable: true }) datePrepared: string;
  @Column({ nullable: true }) yearCovered: string;
  @Column({ nullable: true }) totalPersonnel: string;
  @Column({ nullable: true }) purpose: string;
  @Column({ nullable: true }) raterName: string;
  @Column({ nullable: true }) designation: string;
  @Column({ type: 'jsonb', nullable: true }) workforceProfile: any;
  @Column({ type: 'jsonb', nullable: true }) coreCompetencies: any;
  @Column({ type: 'jsonb', nullable: true }) leadershipComps: any;
  @Column({ type: 'jsonb', nullable: true }) orgComps: any;
  @Column({ type: 'jsonb', nullable: true }) technicalComps: any;
  @Column({ type: 'jsonb', nullable: true }) clusterSummaryRaw: any;
  @Column({ type: 'jsonb', nullable: true }) dataSourcesRaw: any;
  @Column({ type: 'jsonb', nullable: true }) dataSourceInsights: any;
  @Column({ type: 'jsonb', nullable: true }) leadInterventions: any;

  @CreateDateColumn() submittedAt: Date;
}
