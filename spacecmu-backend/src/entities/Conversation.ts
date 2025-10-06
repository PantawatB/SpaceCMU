import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  OneToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Message } from "./Message";

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  /**
   * Users who are part of this conversation.
   * This will be a many-to-many relationship with User.
   */
  @ManyToMany(() => User)
  @JoinTable({ name: "conversation_participants" })
  participants!: User[];

  /**
   * All messages within this conversation.
   */
  @OneToMany(() => Message, (message) => message.conversation)
  messages!: Message[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
