import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Conversation } from "./Conversation";

@Entity()
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  /**
   * The user who sent this message.
   */
  @ManyToOne(() => User, (user) => user.sentMessages, { onDelete: "CASCADE" })
  sender!: User;

  /**
   * The conversation this message belongs to.
   */
  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: "CASCADE",
  })
  conversation!: Conversation;

  /**
   * The text content of the message.
   */
  @Column("text")
  content!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
