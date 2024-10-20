/*
  Warnings:

  - A unique constraint covering the columns `[userId,achievementId,tier]` on the table `UserAchievement` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UserAchievement_userId_achievementId_key";

-- AlterTable
ALTER TABLE "AchievementProgress" ADD COLUMN "currentTier" INTEGER;

-- AlterTable
ALTER TABLE "UserAchievement" ADD COLUMN "tier" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_tier_key" ON "UserAchievement"("userId", "achievementId", "tier");
