import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('idp_field_suggestions')
export class IdpSuggestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'field_name', length: 50 })
  fieldName: string; // 'hei' or 'proact'

  @Column({ type: 'text' })
  value: string;

  @Column({ name: 'used_count', default: 1 })
  usedCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
