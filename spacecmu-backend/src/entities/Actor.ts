// src/entities/Actor.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Persona } from "./Persona";
import { FriendRequest } from "./FriendRequest";
import { Post } from "./Post";
import { Comment } from "./Comment";
0;

@Entity()
export class Actor {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // ลิงก์ไปยัง User (ถ้า Actor นี้คือ User)
  @OneToOne(() => User, (user) => user.actor, { onDelete: "CASCADE" })
  @JoinColumn()
  user?: User;

  // ลิงก์ไปยัง Persona (ถ้า Actor นี้คือ Persona)
  @OneToOne(() => Persona, (persona) => persona.actor)
  @JoinColumn()
  persona?: Persona;

  // ความสัมพันธ์เพื่อน จะถูกย้ายมาอยู่ที่นี่
  @ManyToMany(() => Actor)
  @JoinTable({ name: "actor_friends" })
  friends!: Actor[];

  // คำขอเป็นเพื่อน ก็จะอยู่ที่นี่เช่นกัน
  @OneToMany(() => FriendRequest, (fr) => fr.fromActor)
  sentFriendRequests!: FriendRequest[];

  @OneToMany(() => FriendRequest, (fr) => fr.toActor)
  receivedFriendRequests!: FriendRequest[];

  @ManyToMany(() => Post, (post) => post.likedBy)
  likedPosts!: Post[];

  @ManyToMany(() => Post, (post) => post.repostedBy)
  repostedPosts!: Post[];

  @ManyToMany(() => Post, (post) => post.savedBy)
  savedPosts!: Post[];

  @OneToMany(() => Comment, (comment) => comment.actor)
  comments!: Comment[];
}
