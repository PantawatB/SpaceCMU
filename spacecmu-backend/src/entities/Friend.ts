import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from './User';

/**
 * The Friend entity models accepted friendships between two users. It stores
 * pairs of user IDs. We do not enforce a strict order of user1 and user2,
 * allowing a friend query to be made independent of direction.
 */
@Entity()
export class Friend {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * First participant in the friendship. In our API we ensure that user1.id <
   * user2.id to avoid duplicate pairs.
   */
  @ManyToOne(() => User, { eager: true })
  user1!: User;

  /**
   * Second participant in the friendship.
   */
  @ManyToOne(() => User, { eager: true })
  user2!: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}