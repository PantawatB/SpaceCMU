import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  Unique,
} from "typeorm";
import { User } from "./User";

/**
 * The Friend entity models accepted friendships between two users.
 * It stores pairs of user IDs. We enforce uniqueness on (user1, user2)
 * to avoid duplicate friendship records.
 */
@Entity()
@Unique(["user1", "user2"])
export class Friend {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  /**
   * First participant in the friendship.
   */
  @ManyToOne(() => User, (user) => user.friendships1, { eager: true })
  user1!: User;

  /**
   * Second participant in the friendship.
   */
  @ManyToOne(() => User, (user) => user.friendships2, { eager: true })
  user2!: User;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt!: Date;
}
