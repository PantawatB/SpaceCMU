import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCascadeDeleteToAllUserRelations1760510000000
  implements MigrationInterface
{
  name = "AddCascadeDeleteToAllUserRelations1760510000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Fix Chat.createdBy foreign key
    await queryRunner.query(
      `ALTER TABLE "chat" DROP CONSTRAINT IF EXISTS "FK_dfdc3ecfa68ebd6c767b5702419"`
    );
    await queryRunner.query(`
            ALTER TABLE "chat" 
            ADD CONSTRAINT "FK_dfdc3ecfa68ebd6c767b5702419" 
            FOREIGN KEY ("createdBy") 
            REFERENCES "user"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

    // Fix Product.seller foreign key
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "FK_d2d20ea988ab336e4ee9c89e6cd"`
    );
    await queryRunner.query(`
            ALTER TABLE "products" 
            ADD CONSTRAINT "FK_d2d20ea988ab336e4ee9c89e6cd" 
            FOREIGN KEY ("sellerId") 
            REFERENCES "user"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert Chat.createdBy foreign key
    await queryRunner.query(
      `ALTER TABLE "chat" DROP CONSTRAINT IF EXISTS "FK_dfdc3ecfa68ebd6c767b5702419"`
    );
    await queryRunner.query(`
            ALTER TABLE "chat" 
            ADD CONSTRAINT "FK_dfdc3ecfa68ebd6c767b5702419" 
            FOREIGN KEY ("createdBy") 
            REFERENCES "user"("id") 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);

    // Revert Product.seller foreign key
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "FK_d2d20ea988ab336e4ee9c89e6cd"`
    );
    await queryRunner.query(`
            ALTER TABLE "products" 
            ADD CONSTRAINT "FK_d2d20ea988ab336e4ee9c89e6cd" 
            FOREIGN KEY ("sellerId") 
            REFERENCES "user"("id") 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);
  }
}
