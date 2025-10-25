import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Actor } from "./Actor";

export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  FILE = "file",
  SYSTEM = "system", // System messages (user joined, left, etc.)
}

export enum MessageStatus {
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
}

/**
 * Message entity represents individual messages in chats
 */
@Entity()
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  /**
   * The chat this message belongs to
   */
  @ManyToOne("Chat", "messages", { onDelete: "CASCADE" })
  @JoinColumn({ name: "chatId" })
  chat!: any;

  /**
   * User who sent the message
   */
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "senderId" })
  sender!: User;

  /**
   * ✅ Actor (User or Persona) who sent the message
   * This allows tracking which identity sent the message
   */
  @ManyToOne(() => Actor, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "senderActorId" })
  senderActor?: Actor;

  /**
   * Type of message (text, image, file, system)
   */
  @Column({
    type: "enum",
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type!: MessageType;

  /**
   * Message content (text)
   */
  @Column({ type: "text", nullable: true })
  content?: string;

  /**
   * File URL (for image/file messages)
   */
  @Column({ nullable: true })
  fileUrl?: string;

  /**
   * Original filename (for file messages)
   */
  @Column({ nullable: true })
  fileName?: string;

  /**
   * File size in bytes (for file messages)
   */
  @Column({ nullable: true })
  fileSize?: number;

  /**
   * Message status (sent, delivered, read)
   */
  @Column({
    type: "enum",
    enum: MessageStatus,
    default: MessageStatus.SENT,
  })
  status!: MessageStatus;

  /**
   * Reply to another message (optional)
   */
  @ManyToOne("Message", { nullable: true })
  @JoinColumn({ name: "replyToId" })
  replyTo?: any;

  /**
   * Whether message is edited
   */
  @Column({ default: false })
  isEdited!: boolean;

  /**
   * When message was edited (if applicable)
   */
  @Column({ nullable: true })
  editedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
