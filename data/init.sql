-- SpaceCMU Database Initialization Script
-- This script creates the basic database structure and sample data

-- Note: The main database schema is managed by TypeORM migrations
-- This file provides SQL examples for manual database setup if needed

-- Example: Create admin user (if not using the registration system)
-- Password hash for "Admin123!" - you should generate your own hash
-- INSERT INTO "user" (email, username, password, role, "isBanned", "createdAt", "updatedAt")
-- VALUES (
--   'admin@cmu.ac.th',
--   'Admin User',
--   '$2b$10$YourHashedPasswordHere',
--   'admin',
--   false,
--   NOW(),
--   NOW()
-- );

-- Example: Query to check all users
-- SELECT id, email, username, role, "isBanned", "createdAt" FROM "user";

-- Example: Query to check all posts
-- SELECT p.id, p.caption, u.username as author, p."createdAt"
-- FROM post p
-- JOIN "user" u ON p."authorId" = u.id
-- ORDER BY p."createdAt" DESC;

-- Example: Query to check friend relationships
-- SELECT 
--   u1.username as user1,
--   u2.username as user2,
--   f.status,
--   f."createdAt"
-- FROM friend f
-- JOIN "user" u1 ON f."user1Id" = u1.id
-- JOIN "user" u2 ON f."user2Id" = u2.id;

-- For actual database initialization, run:
-- docker-compose exec backend npm run migration:run
