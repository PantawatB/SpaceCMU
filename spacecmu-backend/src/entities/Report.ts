import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";
import { Post } from "./Post";
import { Persona } from "./Persona";

/**
 * Report represents a complaint lodged by a user against a post or a persona.
 * The admin can view and take action on these reports.
 */
@Entity()
export class Report {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  /**
   * ผู้ใช้ที่ทำการ report
   */
  @ManyToOne(() => User, (user) => user.reports, {
    onDelete: "CASCADE",
  })
  reportingUser!: User;

  /**
   * โพสต์ที่ถูกรายงาน (optional)
   */
  @ManyToOne(() => Post, (post) => post.reports, {
    nullable: true,
    onDelete: "SET NULL",
  })
  post?: Post | null;

  /**
   * persona ที่ถูกรายงาน (optional)
   */
  @ManyToOne(() => Persona, (persona) => persona.reports, {
    nullable: true,
    onDelete: "SET NULL",
  })
  persona?: Persona | null;

  /**
   * เหตุผลที่ report
   */
  @Column({ type: "text" })
  reason!: string;

  @Column({
    type: "enum",
    enum: ["pending", "reviewed", "actioned"],
    default: "pending",
  })
  status!: "pending" | "reviewed" | "actioned";

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt!: Date;
}
