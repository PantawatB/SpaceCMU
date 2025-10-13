import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinTable,
} from "typeorm";
import { Report } from "./Report";
import { Comment } from "./Comment";
import { Actor } from "./Actor";

@Entity()
export class Post {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  /**
   * The actor who authored the post. This can be either a User's main
   * actor profile or their Persona's actor profile.
   */
  @ManyToOne(() => Actor, { eager: true, onDelete: "CASCADE" })
  actor!: Actor;

  @Column({ type: "text" })
  content!: string;

  /**
   * Optional URL of an image attached to the post.
   */
  @Column({ nullable: true })
  imageUrl?: string;

  /**
   * Optional location string for the post.
   */
  @Column({ nullable: true })
  location?: string;

  @Column({
    type: "enum",
    enum: ["public", "friends"],
    default: "public",
  })
  visibility!: "public" | "friends";

  @ManyToMany(() => Actor, (actor) => actor.likedPosts)
  @JoinTable({ name: "post_likes" })
  likedBy!: Actor[];

  /**
   * Comments on this post.
   */
  @OneToMany(() => Comment, (comment) => comment.post)
  comments!: Comment[];

  /**
   * Users who have reposted this post.
   */
  @ManyToMany(() => Actor, (actor) => actor.repostedPosts)
  @JoinTable({ name: "post_reposts" })
  repostedBy!: Actor[];
  /**
   * Users who have saved this post.
   */
  @ManyToMany(() => Actor, (actor) => actor.savedPosts)
  @JoinTable({ name: "post_saves" })
  savedBy!: Actor[];

  @OneToMany(() => Report, (report) => report.post)
  reports!: Report[];

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt!: Date;
}
