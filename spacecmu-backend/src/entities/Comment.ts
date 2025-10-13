import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Post } from "./Post";
import { Actor } from "./Actor";

@Entity()
export class Comment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  /**
   * The user who wrote the comment.
   */
  @ManyToOne(() => Actor, (actor) => actor.comments, { onDelete: "CASCADE" })
  actor!: Actor;

  /**
   * The post this comment belongs to.
   */
  @ManyToOne(() => Post, (post) => post.comments, { onDelete: "CASCADE" })
  post!: Post;

  /**
   * The text content of the comment.
   */
  @Column("text")
  content!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
