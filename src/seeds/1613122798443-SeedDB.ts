import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDB1613122798443 implements MigrationInterface {
  name = ' SeedDB1613122798443';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO tags (name) VALUES ('dragons'), ('coffee'), ('nestjs')`,
    );

    // password is 222
    await queryRunner.query(
      `INSERT INTO users (username, email, password) VALUES ('foo', 'foo@gmail.com', '$2b$10$jCl53WiUEN9KNRWXTtMfy.a9QyRgSkt9A7rFU7K6ZbMvmxVpl5RYi')`,
    );

    await queryRunner.query(
      `INSERT INTO articles (slug, title, description, body, "tagList", "authorId") 
      VALUES ('first-article', 'First Article Title', 'first article description', 'first article body', 'nestjs,dragons', 1)`,
    );

    await queryRunner.query(
      `INSERT INTO articles (slug, title, description, body, "tagList", "authorId") 
      VALUES ('second-article', 'Second Article Title', 'second article description', 'second article body', 'coffee,dragons', 1)`,
    );
  }

  public async down(): Promise<void> {}
}
