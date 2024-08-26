/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `discordConnectionId` on the `User` table. All the data in the column will be lost.
  - Added the required column `userId` to the `DiscordConnection` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DiscordConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "access_token" TEXT NOT NULL,
    "expires_in" INTEGER NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "DiscordConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DiscordConnection" ("access_token", "expires_in", "id", "refresh_token", "scope") SELECT "access_token", "expires_in", "id", "refresh_token", "scope" FROM "DiscordConnection";
DROP TABLE "DiscordConnection";
ALTER TABLE "new_DiscordConnection" RENAME TO "DiscordConnection";
CREATE UNIQUE INDEX "DiscordConnection_access_token_key" ON "DiscordConnection"("access_token");
CREATE UNIQUE INDEX "DiscordConnection_userId_key" ON "DiscordConnection"("userId");
CREATE UNIQUE INDEX "DiscordConnection_userId_access_token_key" ON "DiscordConnection"("userId", "access_token");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);
INSERT INTO "new_User" ("id", "name") SELECT "id", "name" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
