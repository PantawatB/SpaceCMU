import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  Unique,
} from "typeorm";
import { User } from "./User";

/**
 * FriendRequest represents a pending request between two users.
 * When accepted the Friend entity is created; otherwise it is removed.
 */
@Entity()
@Unique(["fromUser", "toUser"]) // ป้องกันการส่ง request ซ้ำ
export class FriendRequest {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  /**
   * ผู้ส่งคำขอเป็นเพื่อน
   */
  @ManyToOne(() => User, (user) => user.sentFriendRequests, {
    eager: true,
    onDelete: "CASCADE", // ถ้าผู้ใช้ถูกลบ -> ลบคำขอด้วย
  })
  fromUser!: User;

  /**
   * ผู้รับคำขอเป็นเพื่อน
   */
  @ManyToOne(() => User, (user) => user.receivedFriendRequests, {
    eager: true,
    onDelete: "CASCADE",
  })
  toUser!: User;

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
