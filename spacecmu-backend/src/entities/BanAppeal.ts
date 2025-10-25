import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";

/**
 * BanAppeal represents a request from a banned user to be unbanned.
 */
@Entity()
export class BanAppeal {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  /**
   * ผู้ใช้ที่ขออุทธรณ์
   */
  @ManyToOne(() => User, {
    onDelete: "CASCADE",
  })
  user!: User;

  /**
   * เหตุผลที่ขออุทธรณ์
   */
  @Column({ type: "text" })
  reason!: string;

  @Column({
    type: "enum",
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  })
  status!: "pending" | "approved" | "rejected";

  /**
   * Admin response (optional)
   */
  @Column({ type: "text", nullable: true })
  adminResponse?: string | null;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt!: Date;
}
