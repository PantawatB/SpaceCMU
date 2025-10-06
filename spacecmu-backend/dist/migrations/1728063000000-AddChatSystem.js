"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddChatSystem1728063000000 = void 0;
class AddChatSystem1728063000000 {
    constructor() {
        this.name = "AddChatSystem1728063000000";
    }
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create ChatType enum
            yield queryRunner.query(`CREATE TYPE "public"."chat_type_enum" AS ENUM('direct', 'group')`);
            // Create MessageType enum
            yield queryRunner.query(`CREATE TYPE "public"."message_type_enum" AS ENUM('text', 'image', 'file', 'system')`);
            // Create MessageStatus enum
            yield queryRunner.query(`CREATE TYPE "public"."message_status_enum" AS ENUM('sent', 'delivered', 'read')`);
            // Create Chat table
            yield queryRunner.query(`
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
            yield queryRunner.query(`
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
            yield queryRunner.query(`
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
            yield queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "FK_chat_createdBy" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "FK_chat_lastMessage" FOREIGN KEY ("lastMessageId") REFERENCES "message"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_message_chat" FOREIGN KEY ("chatId") REFERENCES "chat"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_message_sender" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_message_replyTo" FOREIGN KEY ("replyToId") REFERENCES "message"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "chat_participant" ADD CONSTRAINT "FK_chatParticipant_chat" FOREIGN KEY ("chatId") REFERENCES "chat"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "chat_participant" ADD CONSTRAINT "FK_chatParticipant_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
            // Add indexes for performance
            yield queryRunner.query(`CREATE INDEX "IDX_message_chatId" ON "message" ("chatId")`);
            yield queryRunner.query(`CREATE INDEX "IDX_message_senderId" ON "message" ("senderId")`);
            yield queryRunner.query(`CREATE INDEX "IDX_message_createdAt" ON "message" ("createdAt")`);
            yield queryRunner.query(`CREATE INDEX "IDX_chatParticipant_chatId" ON "chat_participant" ("chatId")`);
            yield queryRunner.query(`CREATE INDEX "IDX_chatParticipant_userId" ON "chat_participant" ("userId")`);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            // Drop indexes
            yield queryRunner.query(`DROP INDEX "public"."IDX_chatParticipant_userId"`);
            yield queryRunner.query(`DROP INDEX "public"."IDX_chatParticipant_chatId"`);
            yield queryRunner.query(`DROP INDEX "public"."IDX_message_createdAt"`);
            yield queryRunner.query(`DROP INDEX "public"."IDX_message_senderId"`);
            yield queryRunner.query(`DROP INDEX "public"."IDX_message_chatId"`);
            // Drop foreign key constraints
            yield queryRunner.query(`ALTER TABLE "chat_participant" DROP CONSTRAINT "FK_chatParticipant_user"`);
            yield queryRunner.query(`ALTER TABLE "chat_participant" DROP CONSTRAINT "FK_chatParticipant_chat"`);
            yield queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_message_replyTo"`);
            yield queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_message_sender"`);
            yield queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_message_chat"`);
            yield queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "FK_chat_lastMessage"`);
            yield queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "FK_chat_createdBy"`);
            // Drop tables
            yield queryRunner.query(`DROP TABLE "chat_participant"`);
            yield queryRunner.query(`DROP TABLE "message"`);
            yield queryRunner.query(`DROP TABLE "chat"`);
            // Drop enums
            yield queryRunner.query(`DROP TYPE "public"."message_status_enum"`);
            yield queryRunner.query(`DROP TYPE "public"."message_type_enum"`);
            yield queryRunner.query(`DROP TYPE "public"."chat_type_enum"`);
        });
    }
}
exports.AddChatSystem1728063000000 = AddChatSystem1728063000000;
