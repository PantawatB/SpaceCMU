import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from './User';

/**
 * FriendRequest represents a pending request between two users. When accepted
 * the Friend entity is created; otherwise it is removed. Requests expire
 * automatically after a period (not implemented here).
 */
@Entity()
export class FriendRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { eager: true })
  fromUser!: User;

  @ManyToOne(() => User, { eager: true })
  toUser!: User;

  @Column({ type: 'enum', enum: ['pending', 'accepted', 'declined'], default: 'pending' })
  status!: 'pending' | 'accepted' | 'declined';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}