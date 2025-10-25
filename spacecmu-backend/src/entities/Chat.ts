import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

export enum ChatType {
  DIRECT = "direct", // แชทส่วนตัว 1:1
  GROUP = "group", // แชทกลุ่ม
}

/**
 * Chat/Conversation entity represents a conversation between users
 * Can be either direct (1:1) or group chat
 */
@Entity()
export class Chat {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  /**
   * Type of chat: direct message or group chat
   */
  @Column({
    type: "enum",
    enum: ChatType,
    default: ChatType.DIRECT,
  })
  type!: ChatType;

  /**
   * Chat name (for group chats)
   */
  @Column({ nullable: true })
  name?: string;

  /**
   * Chat description (for group chats)
   */
  @Column({ nullable: true })
  description?: string;

  /**
   * Creator of the chat (for group chats)
   */
  @ManyToOne(() => User, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "createdBy" })
  createdBy?: User;

  /**
   * Last message in this chat (for preview)
   */
  @ManyToOne("Message", { nullable: true })
  @JoinColumn({ name: "lastMessageId" })
  lastMessage?: any;

  /**
   * All messages in this chat
   */
  @OneToMany("Message", "chat", { cascade: true })
  messages!: any[];

  /**
   * All participants in this chat
   */
  @OneToMany("ChatParticipant", "chat")
  participants!: any[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
