import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Unique,
} from "typeorm";
import { User } from "./User";

/**
 * ChatParticipant entity represents users in a chat
 * Junction table for many-to-many relationship between users and chats
 */
@Entity()
@Unique(["chat", "user"]) // Prevent duplicate participants
export class ChatParticipant {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  /**
   * The chat this participation belongs to
   */
  @ManyToOne("Chat", { onDelete: "CASCADE" })
  @JoinColumn({ name: "chatId" })
  chat!: any;

  /**
   * The user participating in the chat
   */
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  /**
   * When the user joined the chat
   */
  @CreateDateColumn()
  joinedAt!: Date;

  /**
   * When the user last read messages (for unread count)
   */
  @UpdateDateColumn()
  lastReadAt!: Date;
}
