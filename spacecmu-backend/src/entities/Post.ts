import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinTable,
} from "typeorm";
import { User } from "./User";
import { Persona } from "./Persona";
import { Report } from "./Report";
import { Comment } from "./Comment";

@Entity()
export class Post {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  /**
   * The user who authored the post. Even for anonymous posts the underlying
   * user is always stored to allow accountability.
   */
  @ManyToOne(() => User, (user) => user.posts)
  user!: User;

  /**
   * The persona used to post anonymously. Null when the post is published as
   * the real user. Only one of persona or userDisplayName/avatar is ever used.
   */
  @ManyToOne(() => Persona, { nullable: true })
  persona?: Persona | null;

  @Column({ type: "text" })
  content!: string;

  /**
   * Optional URL of an image attached to the post. In a complete system the
   * image would be uploaded to an object storage service and its URL saved.
   */
  @Column({ nullable: true })
  imageUrl?: string;

  /**
   * 👇👇 เพิ่ม field นี้
   * Optional location string for the post.
   */
  @Column({ nullable: true })
  location?: string;

  /**
   * Whether the post is anonymous. This flag helps quickly identify if a post
   * should display persona details on the client side.
   */
  @Column({ default: false })
  isAnonymous!: boolean;

  @Column({
    type: "enum",
    enum: ["public", "friends"],
    default: "public",
  })
  visibility!: "public" | "friends";

  @ManyToMany(() => User, (user) => user.likedPosts, { eager: true })
  @JoinTable({ name: "post_likes" })
  likedBy!: User[];

  /**
   * Comments on this post.
   */
  @OneToMany(() => Comment, (comment) => comment.post)
  comments!: Comment[];

  /**
   * Users who have reposted this post.
   */
  @ManyToMany(() => User, (user) => user.repostedPosts)
  @JoinTable({ name: "post_reposts" })
  repostedBy!: User[];

  /**
   * Users who have saved this post.
   */
  @ManyToMany(() => User, (user) => user.savedPosts)
  @JoinTable({ name: "post_saves" })
  savedBy!: User[];

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
