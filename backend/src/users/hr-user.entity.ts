import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('hr_users')
export class HrUser {
  @PrimaryGeneratedColumn() id: number;
  @Column({ unique: true }) email: string;
  @Column() name: string;
  @Column({ nullable: true }) role: string;
  @CreateDateColumn() dateAdded: Date;
}
