import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './User';
import { Post } from './Post';
import { Persona } from './Persona';

/**
 * Report represents a complaint lodged by a user against a post or a persona.
 * The admin can view and take action on these reports.
 */
@Entity()
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.reports)
  reportingUser!: User;

  /**
   * Optionally the post being reported. Null when the report targets a persona.
   */
  @ManyToOne(() => Post, { nullable: true })
  post?: Post | null;

  /**
   * Optionally the persona being reported. Null when reporting a post directly.
   */
  @ManyToOne(() => Persona, { nullable: true })
  persona?: Persona | null;

  /**
   * Explanation or reason provided by the reporting user.
   */
  @Column({ type: 'text' })
  reason!: string;

  @Column({ type: 'enum', enum: ['pending', 'reviewed', 'actioned'], default: 'pending' })
  status!: 'pending' | 'reviewed' | 'actioned';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}