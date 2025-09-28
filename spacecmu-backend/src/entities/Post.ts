import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './User';
import { Persona } from './Persona';

/**
 * Posts represent messages authored by users. A post may be linked either to
 * the real user or to a persona when published anonymously. Posts can be
 * restricted to friends or made public and may include an optional image.
 */
@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
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

  /**
   * The textual content of the post. Sanitisation (e.g. XSS prevention) must
   * occur at either the controller layer or the database layer.
   */
  @Column({ type: 'text' })
  content!: string;

  /**
   * Optional URL of an image attached to the post. In a complete system the
   * image would be uploaded to an object storage service and its URL saved.
   */
  @Column({ nullable: true })
  imageUrl?: string;

  /**
   * Whether the post is anonymous. This flag helps quickly identify if a post
   * should display persona details on the client side.
   */
  @Column({ default: false })
  isAnonymous!: boolean;

  /**
   * The visibility of the post. Public posts show up in the global feed and
   * friend feed, while friend‑only posts are visible only to mutual friends.
   */
  @Column({ type: 'enum', enum: ['public', 'friends'], default: 'public' })
  visibility!: 'public' | 'friends';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}