import { MigrationInterface, QueryRunner } from "typeorm";

export class AddChatSystem1728063000000 implements MigrationInterface {
  name = "AddChatSystem1728063000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ChatType enum
    await queryRunner.query(
      `CREATE TYPE "public"."chat_type_enum" AS ENUM('direct', 'group')`
    );

    // Create MessageType enum
    await queryRunner.query(
      `CREATE TYPE "public"."message_type_enum" AS ENUM('text', 'image', 'file', 'system')`
    );

    // Create MessageStatus enum
    await queryRunner.query(
      `CREATE TYPE "public"."message_status_enum" AS ENUM('sent', 'delivered', 'read')`
    );

    // Create Chat table
    await queryRunner.query(`
            CREATE TABLE "chat" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "type" "public"."chat_type_enum" NOT NULL DEFAULT 'direct',
                "name" character varying,
                "description" character varying,
                "createdBy" uuid,
                "lastMessageId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_9d0b2ba74336710fd31154738a5" PRIMARY KEY ("id")
            )
        `);

    // Create Message table
    await queryRunner.query(`
            CREATE TABLE "message" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "chatId" uuid NOT NULL,
                "senderId" uuid NOT NULL,
                "type" "public"."message_type_enum" NOT NULL DEFAULT 'text',
                "content" text,
                "fileUrl" character varying,
                "fileName" character varying,
                "fileSize" integer,
                "status" "public"."message_status_enum" NOT NULL DEFAULT 'sent',
                "replyToId" uuid,
                "isEdited" boolean NOT NULL DEFAULT false,
                "editedAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id")
            )
        `);

    // Create ChatParticipant table
    await queryRunner.query(`
            CREATE TABLE "chat_participant" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "chatId" uuid NOT NULL,
                "userId" uuid NOT NULL,
                "joinedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "lastReadAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_chat_participant_id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_chat_participant" UNIQUE ("chatId", "userId")
            )
        `);

    // Add foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "chat" ADD CONSTRAINT "FK_chat_createdBy" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "chat" ADD CONSTRAINT "FK_chat_lastMessage" FOREIGN KEY ("lastMessageId") REFERENCES "message"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "message" ADD CONSTRAINT "FK_message_chat" FOREIGN KEY ("chatId") REFERENCES "chat"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "message" ADD CONSTRAINT "FK_message_sender" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "message" ADD CONSTRAINT "FK_message_replyTo" FOREIGN KEY ("replyToId") REFERENCES "message"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "chat_participant" ADD CONSTRAINT "FK_chatParticipant_chat" FOREIGN KEY ("chatId") REFERENCES "chat"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "chat_participant" ADD CONSTRAINT "FK_chatParticipant_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    // Add indexes for performance
    await queryRunner.query(
      `CREATE INDEX "IDX_message_chatId" ON "message" ("chatId")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_message_senderId" ON "message" ("senderId")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_message_createdAt" ON "message" ("createdAt")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_chatParticipant_chatId" ON "chat_participant" ("chatId")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_chatParticipant_userId" ON "chat_participant" ("userId")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "public"."IDX_chatParticipant_userId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_chatParticipant_chatId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_message_createdAt"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_message_senderId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_message_chatId"`);

    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "chat_participant" DROP CONSTRAINT "FK_chatParticipant_user"`
    );
    await queryRunner.query(
      `ALTER TABLE "chat_participant" DROP CONSTRAINT "FK_chatParticipant_chat"`
    );
    await queryRunner.query(
      `ALTER TABLE "message" DROP CONSTRAINT "FK_message_replyTo"`
    );
    await queryRunner.query(
      `ALTER TABLE "message" DROP CONSTRAINT "FK_message_sender"`
    );
    await queryRunner.query(
      `ALTER TABLE "message" DROP CONSTRAINT "FK_message_chat"`
    );
    await queryRunner.query(
      `ALTER TABLE "chat" DROP CONSTRAINT "FK_chat_lastMessage"`
    );
    await queryRunner.query(
      `ALTER TABLE "chat" DROP CONSTRAINT "FK_chat_createdBy"`
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE "chat_participant"`);
    await queryRunner.query(`DROP TABLE "message"`);
    await queryRunner.query(`DROP TABLE "chat"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE "public"."message_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."message_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."chat_type_enum"`);
  }
}
