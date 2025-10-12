import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from "typeorm";
import { Persona } from "./Persona";
import { Post } from "./Post";
import { Friend } from "./Friend";
import { Report } from "./Report";
import { Comment } from "./Comment";
import { FriendRequest } from "./FriendRequest";
import { Message } from "./Message";

/**
 * The User entity represents a single CMU student in the system. A user has
 * exactly one account bound to a student ID and CMU email. Each user may
 * optionally have one anonymous persona. Users can author posts, send and
 * accept friend requests and report content. An admin is simply a user
 * flagged with the `isAdmin` field.
 */
@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  /**
   * University-issued student ID. Uniqueness ensures one account per student.
   */
  @Column({ unique: true })
  studentId!: string;

  /**
   * Official CMU email address. Should be validated during registration.
   */
  @Column({ unique: true })
  email!: string;

  /**
   * Password hash stored securely.
   */
  @Column()
  passwordHash!: string;

  /**
   * Display name of the real user (not the anonymous persona).
   */
  @Column()
  name!: string;

  @Column({ nullable: true })
  profileImg?: string;

  @Column({ type: "text", nullable: true }) // ใช้ type: "text" สำหรับข้อความยาวๆ
  bio?: string;

  /**
   * Optional flag used to elevate a user to administrator privileges.
   */
  @Column({ default: false })
  isAdmin!: boolean;

  /**
   * Flag indicating whether this user account has been banned.
   */
  @Column({ default: false })
  isBanned!: boolean;

  /**
   * Time of creation. Helpful for auditing and rate limiting.
   */
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  /**
   * Timestamp of last update. Managed by TypeORM.
   */
  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt!: Date;

  /**
   * One-to-one relation to a persona. A user may create at most one persona.
   */
  @OneToOne(() => Persona, (persona) => persona.user, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn()
  persona?: Persona;

  /**
   * Posts authored by the user (both anonymous and real).
   */
  @OneToMany(() => Post, (post) => post.user)
  posts!: Post[];

  /**
   * Friendships where this user is user1.
   */
  @OneToMany(() => Friend, (friend) => friend.user1)
  friendships1!: Friend[];

  /**
   * Friendships where this user is user2.
   */
  @OneToMany(() => Friend, (friend) => friend.user2)
  friendships2!: Friend[];

  /**
   * Friend requests (sent and received).
   */
  @OneToMany(() => FriendRequest, (fr) => fr.fromUser)
  sentFriendRequests!: FriendRequest[];

  @OneToMany(() => FriendRequest, (fr) => fr.toUser)
  receivedFriendRequests!: FriendRequest[];

  /**
   * Many-to-many self-referential relation for accepted friendships.
   * (Optional: if you want to query friends directly without Friend entity)
   */
  @ManyToMany(() => User, (user) => user.friends)
  @JoinTable({ name: "user_friends" })
  friends!: User[];

  /**
   * Reports created by this user.
   */
  @OneToMany(() => Report, (report) => report.reportingUser)
  reports!: Report[];

  /**
   * Posts liked by this user.
   */
  @ManyToMany(() => Post, (post) => post.likedBy)
  likedPosts!: Post[];

  /**
   * Comments made by this user.
   */
  @OneToMany(() => Comment, (comment) => comment.user)
  comments!: Comment[];

  /**
   * Posts reposted by this user.
   */
  @ManyToMany(() => Post, (post) => post.repostedBy)
  repostedPosts!: Post[];

  /**
   * Posts saved by this user.
   */
  @ManyToMany(() => Post, (post) => post.savedBy)
  savedPosts!: Post[];

  // Note: Conversations are handled through ChatParticipant entity
  // @ManyToMany(() => Conversation, (conversation) => conversation.participants)
  // conversations!: Conversation[];

  /**
   * Messages sent by this user.
   */
  @OneToMany(() => Message, (message) => message.sender)
  sentMessages!: Message[];

  /**
   * Timestamp of the last user activity.
   */
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  lastActiveAt!: Date;
}
