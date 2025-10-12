import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Report } from "./Report";
import { Actor } from "./Actor";

/**
 * Persona = ตัวตนเสมือน/นามแฝงของ user
 * ใช้สำหรับโพสต์ anonymous
 */
@Entity()
export class Persona {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  /**
   * User เจ้าของ persona (1:1)
   */
  @OneToOne(() => User, (user) => user.persona, { onDelete: "CASCADE" })
  @JoinColumn()
  user!: User;

  /**
   * Display name ของ persona (นามแฝง)
   */
  @Column()
  displayName!: string;

  /**
   * Avatar ของ persona (optional)
   */
  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ type: "text", nullable: true })
  bio?: string;

  /**
   * จำนวนครั้งที่เปลี่ยน persona ในเดือนนี้
   */
  @Column({ default: 0 })
  changeCount!: number;

  /**
   * เวลาที่เปลี่ยน persona ครั้งล่าสุด
   */
  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  lastChangedAt!: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt!: Date;

  /**
   * Flag ว่า persona ถูกแบนหรือไม่
   */
  @Column({ default: false })
  isBanned!: boolean;

  /**
   * Posts ที่โพสต์โดยใช้ persona (anonymous posts)
   */
  @OneToMany(() => Report, (report) => report.persona)
  reports!: Report[];

  /**
   * The social actor profile for this Persona.
   */
  @OneToOne(() => Actor, (actor) => actor.persona, { cascade: true })
  actor!: Actor;
}
