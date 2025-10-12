import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  Unique,
} from "typeorm";
import { Actor } from "./Actor";

/**
 * FriendRequest represents a pending request between two users.
 * When accepted the Friend entity is created; otherwise it is removed.
 */
@Entity()
@Unique(["fromActor", "toActor"])
export class FriendRequest {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  /**
   * ผู้ส่งคำขอเป็นเพื่อน
   */
  @ManyToOne(() => Actor, (actor) => actor.sentFriendRequests, {
    eager: true,
    onDelete: "CASCADE",
  })
  fromActor!: Actor;

  /**
   * ผู้รับคำขอเป็นเพื่อน
   */
  @ManyToOne(() => Actor, (actor) => actor.receivedFriendRequests, {
    eager: true,
    onDelete: "CASCADE",
  })
  toActor!: Actor;

  /**
   * สถานะของคำขอ
   */
  @Column({
    type: "enum",
    enum: ["pending", "accepted", "declined"],
    default: "pending",
  })
  status!: "pending" | "accepted" | "declined";

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt!: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt!: Date;
}
