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
import { Actor } from "./Actor";

/**
 * ChatParticipant entity represents users in a chat
 * Junction table for many-to-many relationship between users and chats
 * ✅ Now tracks which Actor (User or Persona) is participating
 */
@Entity()
@Unique(["chat", "user", "actor"]) // Prevent duplicate participants
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
   * ✅ The actor (User or Persona) participating in the chat
   * This allows separate chats for User vs Persona of the same person
   */
  @ManyToOne(() => Actor, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "actorId" })
  actor?: Actor;

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
