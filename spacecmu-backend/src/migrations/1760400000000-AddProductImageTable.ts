import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from "typeorm";

export class AddProductImageTable1760400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create product_images table
    await queryRunner.createTable(
      new Table({
        name: "product_images",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "filename",
            type: "varchar",
            length: "255",
          },
          {
            name: "originalName",
            type: "varchar",
            length: "255",
          },
          {
            name: "mimeType",
            type: "varchar",
            length: "50",
          },
          {
            name: "fileSize",
            type: "integer",
          },
          {
            name: "filePath",
            type: "varchar",
            length: "500",
          },
          {
            name: "publicUrl",
            type: "varchar",
            length: "500",
          },
          {
            name: "isActive",
            type: "boolean",
            default: true,
          },
          {
            name: "productId",
            type: "int",
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true
    );

    // Create index on productId
    await queryRunner.createIndex(
      "product_images",
      new TableIndex({
        name: "IDX_product_images_productId",
        columnNames: ["productId"],
      })
    );

    // Create foreign key constraint
    await queryRunner.createForeignKey(
      "product_images",
      new TableForeignKey({
        columnNames: ["productId"],
        referencedTableName: "products",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("product_images");
  }
}
