import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { Persona } from './Persona';
import { Post } from './Post';
import { Friend } from './Friend';
import { Report } from './Report';

/**
 * The User entity represents a single CMU student in the system. A user has
 * exactly one account bound to a student ID and CMU email. Each user may
 * optionally have one anonymous persona. Users can author posts, send and
 * accept friend requests and report content. An admin is simply a user
 * flagged with the `isAdmin` field.
 */
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * University‑issued student ID. Uniqueness ensures one account per student.
   */
  @Column({ unique: true })
  studentId!: string;

  /**
   * Official CMU email address. Should be validated during registration.
   */
  @Column({ unique: true })
  email!: string;

  /**
   * Password hash stored securely. Authentication is out of scope for this
   * example; in a real project you'd handle login via SSO or hashed passwords.
   */
  @Column()
  passwordHash!: string;

  /**
   * Display name of the real user (not the anonymous persona).
   */
  @Column()
  name!: string;

  /**
   * Optional flag used to elevate a user to administrator privileges. Admins
   * can moderate content and view persona identities.
   */
  @Column({ default: false })
  isAdmin!: boolean;

  /**
   * Flag indicating whether this user account has been banned. When true the
   * user should be prevented from logging in and posting.
   */
  @Column({ default: false })
  isBanned!: boolean;

  /**
   * Time of creation. Helpful for auditing and rate limiting.
   */
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  /**
   * Timestamp of last update. Managed by TypeORM.
   */
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  /**
   * One‑to‑one relation to a persona. A user may create at most one persona.
   */
  @OneToOne(() => Persona, (persona) => persona.user, { cascade: true, nullable: true })
  @JoinColumn()
  persona?: Persona;

  /**
   * Posts authored by the user (both anonymous and real).
   */
  @OneToMany(() => Post, (post) => post.user)
  posts!: Post[];

  /**
   * Many‑to‑many self‑referential relation for accepted friendships. The
   * Friend entity manages both sides of the connection.
   */
  @ManyToMany(() => User, (user) => user.friends)
  @JoinTable({ name: 'user_friends' })
  friends!: User[];

  /**
   * Reports created by this user.
   */
  @OneToMany(() => Report, (report) => report.reportingUser)
  reports!: Report[];
}