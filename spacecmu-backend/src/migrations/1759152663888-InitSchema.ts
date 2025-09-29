import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1759152663888 implements MigrationInterface {
    name = 'InitSchema1759152663888'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "persona" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "displayName" character varying NOT NULL, "avatarUrl" character varying, "changeCount" integer NOT NULL DEFAULT '0', "lastChangedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isBanned" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_13aefc75f60510f2be4cd243d71" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."post_visibility_enum" AS ENUM('public', 'friends')`);
        await queryRunner.query(`CREATE TABLE "post" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" text NOT NULL, "imageUrl" character varying, "isAnonymous" boolean NOT NULL DEFAULT false, "visibility" "public"."post_visibility_enum" NOT NULL DEFAULT 'public', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "personaId" uuid, CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."report_status_enum" AS ENUM('pending', 'reviewed', 'actioned')`);
        await queryRunner.query(`CREATE TABLE "report" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reason" text NOT NULL, "status" "public"."report_status_enum" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "reportingUserId" uuid, "postId" uuid, "personaId" uuid, CONSTRAINT "PK_99e4d0bea58cba73c57f935a546" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "studentId" character varying NOT NULL, "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "name" character varying NOT NULL, "isAdmin" boolean NOT NULL DEFAULT false, "isBanned" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "personaId" uuid, CONSTRAINT "UQ_2279dce27cfb8d7b0e6e9bbf5cd" UNIQUE ("studentId"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "REL_92f09d8f74b60402513dbbc6d5" UNIQUE ("personaId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."friend_request_status_enum" AS ENUM('pending', 'accepted', 'declined')`);
        await queryRunner.query(`CREATE TABLE "friend_request" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."friend_request_status_enum" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "fromUserId" uuid, "toUserId" uuid, CONSTRAINT "PK_4c9d23ff394888750cf66cac17c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "friend" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "user1Id" uuid, "user2Id" uuid, CONSTRAINT "PK_1b301ac8ac5fcee876db96069b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_friends" ("userId_1" uuid NOT NULL, "userId_2" uuid NOT NULL, CONSTRAINT "PK_51a013006936cbbbd732ec84162" PRIMARY KEY ("userId_1", "userId_2"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1796d3b9337fa86e5bdbd307ae" ON "user_friends" ("userId_1") `);
        await queryRunner.query(`CREATE INDEX "IDX_0e8d702b68626619d732c1268f" ON "user_friends" ("userId_2") `);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_5c1cf55c308037b5aca1038a131" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_2bb914be25a705f4cc8700fcffc" FOREIGN KEY ("personaId") REFERENCES "persona"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "report" ADD CONSTRAINT "FK_8fc3146206e9f18ac25fba037dc" FOREIGN KEY ("reportingUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "report" ADD CONSTRAINT "FK_4b6fe2df37305bc075a4a16d3ea" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "report" ADD CONSTRAINT "FK_1a01b9dc080213a8649490ec6ff" FOREIGN KEY ("personaId") REFERENCES "persona"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_92f09d8f74b60402513dbbc6d57" FOREIGN KEY ("personaId") REFERENCES "persona"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friend_request" ADD CONSTRAINT "FK_f8af1ebd292163078e6a43ceaab" FOREIGN KEY ("fromUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friend_request" ADD CONSTRAINT "FK_6d3cfadc7211c43a3c1fadc2bcf" FOREIGN KEY ("toUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friend" ADD CONSTRAINT "FK_cdea0930684433d57b67d2a06af" FOREIGN KEY ("user1Id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friend" ADD CONSTRAINT "FK_6d2d856c1279dd59a837a254879" FOREIGN KEY ("user2Id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_friends" ADD CONSTRAINT "FK_1796d3b9337fa86e5bdbd307aeb" FOREIGN KEY ("userId_1") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_friends" ADD CONSTRAINT "FK_0e8d702b68626619d732c1268f1" FOREIGN KEY ("userId_2") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_friends" DROP CONSTRAINT "FK_0e8d702b68626619d732c1268f1"`);
        await queryRunner.query(`ALTER TABLE "user_friends" DROP CONSTRAINT "FK_1796d3b9337fa86e5bdbd307aeb"`);
        await queryRunner.query(`ALTER TABLE "friend" DROP CONSTRAINT "FK_6d2d856c1279dd59a837a254879"`);
        await queryRunner.query(`ALTER TABLE "friend" DROP CONSTRAINT "FK_cdea0930684433d57b67d2a06af"`);
        await queryRunner.query(`ALTER TABLE "friend_request" DROP CONSTRAINT "FK_6d3cfadc7211c43a3c1fadc2bcf"`);
        await queryRunner.query(`ALTER TABLE "friend_request" DROP CONSTRAINT "FK_f8af1ebd292163078e6a43ceaab"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_92f09d8f74b60402513dbbc6d57"`);
        await queryRunner.query(`ALTER TABLE "report" DROP CONSTRAINT "FK_1a01b9dc080213a8649490ec6ff"`);
        await queryRunner.query(`ALTER TABLE "report" DROP CONSTRAINT "FK_4b6fe2df37305bc075a4a16d3ea"`);
        await queryRunner.query(`ALTER TABLE "report" DROP CONSTRAINT "FK_8fc3146206e9f18ac25fba037dc"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_2bb914be25a705f4cc8700fcffc"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_5c1cf55c308037b5aca1038a131"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0e8d702b68626619d732c1268f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1796d3b9337fa86e5bdbd307ae"`);
        await queryRunner.query(`DROP TABLE "user_friends"`);
        await queryRunner.query(`DROP TABLE "friend"`);
        await queryRunner.query(`DROP TABLE "friend_request"`);
        await queryRunner.query(`DROP TYPE "public"."friend_request_status_enum"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "report"`);
        await queryRunner.query(`DROP TYPE "public"."report_status_enum"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`DROP TYPE "public"."post_visibility_enum"`);
        await queryRunner.query(`DROP TABLE "persona"`);
    }

}
