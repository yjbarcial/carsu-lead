import { Entity,  PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('idp_submissions')
export class Idp {
  @PrimaryGeneratedColumn() id: number;

  // Reference ID used as the supervisor token
  @Column() refId: string;

  @Column({ default: 'PENDING' }) status: string;

  // Employee details
  @Column() employeeEmail: string;
  @Column({ nullable: true }) employeeName: string;
  @Column({ nullable: true }) position: string;
  @Column({ nullable: true }) office: string;
  @Column({ nullable: true }) campus: string;
  @Column({ nullable: true }) officeAffiliation: string;
  @Column({ nullable: true }) yearCovered: string;
  @Column({ nullable: true }) headerPurpose: string;
  @Column({ nullable: true }) supervisorEmail: string;
  @Column({ nullable: true }) supervisorName: string;
  @Column({ nullable: true }) yearsInPosition: string;
  @Column({ nullable: true }) yearsInCSU: string;
  @Column({ nullable: true }) datePrepared: string;
  @Column({ nullable: true }) deadline: string;

  // JSON data from the dynamic form tables
  @Column({ type: 'jsonb', nullable: true }) competencyRows: any;
  @Column({ type: 'jsonb', nullable: true }) agapRows: any;
  @Column({ type: 'jsonb', nullable: true }) proactRows: any;

  // Supervisor review (filled in Stage 2)
  @Column({ nullable: true }) supervisorReviewDate: string;
  @Column({ nullable: true }) perfGapsYN: string;
  @Column({ nullable: true }) perfGapsSpec: string;
  @Column({ nullable: true }) readinessYN: string;
  @Column({ nullable: true }) readinessRemarks: string;
  @Column({ type: 'jsonb', nullable: true }) supervisorInterventions: any;
  @Column({ type: 'jsonb', nullable: true }) implementationPeriod: any;
  @Column({ nullable: true }) additionalComments: string;

  @CreateDateColumn() submittedAt: Date;
}
