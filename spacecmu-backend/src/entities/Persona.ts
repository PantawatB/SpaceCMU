import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne } from 'typeorm';
import { User } from './User';

/**
 * The Persona entity represents an anonymous identity belonging to a user. Each
 * user may have at most one persona, which they can use to post anonymously.
 * Although persona details are visible to other users, the underlying user ID
 * remains hidden from the client. Admins can trace a persona back to its
 * corresponding user for accountability.
 */
@Entity()
export class Persona {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * User owning this persona. A one‑to‑one relation ensures only one persona per user.
   */
  @OneToOne(() => User, (user) => user.persona)
  user!: User;

  /**
   * The pseudonymous display name chosen by the user. Visible to other users when
   * the persona posts anonymous content.
   */
  @Column()
  displayName!: string;

  /**
   * Optional avatar URL for the persona. Should be stored in a trusted file
   * storage and validated against allowed formats.
   */
  @Column({ nullable: true })
  avatarUrl?: string;

  /**
   * Tracks how many times the persona name or avatar has been changed within a
   * given period. Use this information to enforce the monthly change limit.
   */
  @Column({ default: 0 })
  changeCount!: number;

  /**
   * Timestamp when the persona was last modified. Combined with changeCount to
   * reset limits monthly.
   */
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastChangedAt!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  /**
   * Flag indicating whether this persona has been banned by an administrator.
   * Banned personas cannot post or be used until restored.
   */
  @Column({ default: false })
  isBanned!: boolean;
}