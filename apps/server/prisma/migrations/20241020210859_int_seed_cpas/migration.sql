/*
  Warnings:

  - You are about to alter the column `seed` on the `Daily` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Daily" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mode" INTEGER NOT NULL,
    "condition" INTEGER NOT NULL,
    "seed" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Daily" ("condition", "createdAt", "id", "mode", "seed") SELECT "condition", "createdAt", "id", "mode", "seed" FROM "Daily";
DROP TABLE "Daily";
ALTER TABLE "new_Daily" RENAME TO "Daily";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "caps" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("id", "level", "name", "xp") SELECT "id", "level", "name", "xp" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
