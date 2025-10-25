import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCascadeDeleteToActor1760500000000
  implements MigrationInterface
{
  name = "AddCascadeDeleteToActor1760500000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the existing foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "actor" DROP CONSTRAINT "FK_486608ab076cf30713b08a3cef1"`
    );

    // Re-add the foreign key constraint with CASCADE delete
    await queryRunner.query(`
            ALTER TABLE "actor" 
            ADD CONSTRAINT "FK_486608ab076cf30713b08a3cef1" 
            FOREIGN KEY ("userId") 
            REFERENCES "user"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the CASCADE constraint
    await queryRunner.query(
      `ALTER TABLE "actor" DROP CONSTRAINT "FK_486608ab076cf30713b08a3cef1"`
    );

    // Re-add the original foreign key constraint without CASCADE
    await queryRunner.query(`
            ALTER TABLE "actor" 
            ADD CONSTRAINT "FK_486608ab076cf30713b08a3cef1" 
            FOREIGN KEY ("userId") 
            REFERENCES "user"("id") 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);
  }
}
