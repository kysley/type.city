import type { AchievementProgress, PrismaClient } from "@prisma/client";
import {
	type Achievement,
	achievements,
	type AchievementTier,
	type AchievementType,
} from ".";
import { prisma } from "../../utils/prisma";

export interface AchievementUpdate {
	achievement: Achievement;
	newProgress: number;
	newTier?: number;
}

class AchievementService {
	private prisma: PrismaClient;

	constructor(prisma: PrismaClient) {
		this.prisma = prisma;
	}

	async updateAchievementProgress(
		userId: string,
		achievementType: AchievementType,
		increment = 1,
	): Promise<AchievementUpdate[]> {
		const updates: AchievementUpdate[] = [];

		const achievement = achievements.find((a) => a.type === achievementType);
		if (!achievement) {
			throw new Error(`Achievement of type ${achievementType} not found`);
		}

		const progress = await this.prisma.achievementProgress.upsert({
			where: {
				userId_achievementId: {
					userId,
					achievementId: achievement.id,
				},
			},
			update: {
				currentProgress: {
					increment: increment,
				},
			},
			create: {
				userId,
				achievementId: achievement.id,
				currentProgress: increment,
				currentTier:
					achievement.tiers && achievement.tiers.length > 0 ? 0 : undefined,
			},
		});

		const check = await this.checkAchievementCompletion(
			userId,
			achievement,
			progress,
		);

		updates.push(check);

		return updates;
	}

	private async checkAchievementCompletion(
		userId: string,
		achievement: Achievement,
		progress: AchievementProgress,
	): Promise<{
		latestTier: AchievementTier;
		latestProgress: AchievementProgress;
		isNewTier: boolean;
	}> {
		if (achievement.tiers && achievement.tiers.length > 0) {
			return this.checkTieredAchievement(userId, achievement, progress);
		}
		// return this.checkNonTieredAchievement(userId, achievement, progress);
	}

	// If the progress update has tiered up
	private async checkTieredAchievement(
		userId: string,
		achievement: Achievement,
		progress: AchievementProgress,
	): Promise<{
		latestTier: AchievementTier;
		latestProgress: AchievementProgress;
		isNewTier: boolean;
	}> {
		if (!achievement.tiers) {
			throw `Achievement ${achievement.id} is not tiered`;
		}

		// 0 => 1
		// 1 => 2
		const nextTier = achievement.tiers.find(
			(t) => t.tier === progress.currentTier! + 1,
		);

		// Okay for now. Will have to loop to make sure there isn't enough progress to tier up multiple times
		if (nextTier) {
			const delta = nextTier.requiredValue - progress.currentProgress;

			// enough progress
			if (delta >= 0) {
				const uAchieved = await prisma.userAchievement.upsert({
					create: {
						achievementId: achievement.id,
						tier: 1,
						userId,
					},
					update: {},
					where: {
						userId_achievementId_tier: {
							userId,
							achievementId: achievement.id,
							tier: 1,
						},
					},
				});
				const uProgress = await prisma.achievementProgress.update({
					data: {
						currentProgress: delta,
						currentTier: nextTier.tier,
					},
					where: {
						userId_achievementId: {
							userId,
							achievementId: achievement.id,
						},
					},
				});

				return {
					latestTier: nextTier,
					latestProgress: uProgress,
					isNewTier: true,
				};
			}
		}

		return {
			latestProgress: progress,
			latestTier: achievement.tiers.find(
				(t) => t.tier === progress.currentTier!,
			)!,
			isNewTier: false,
		};
	}

	private async checkNonTieredAchievement(
		userId: string,
		achievement: Achievement,
		progress: AchievementProgress,
	): Promise<{ newTier?: undefined; isNewlyCompleted: boolean }> {
		const existingAchievement = await this.prisma.userAchievement.findFirst({
			where: {
				userId,
				achievementId: achievement.id,
			},
		});

		if (!existingAchievement) {
			await this.prisma.userAchievement.create({
				data: {
					userId,
					achievementId: achievement.id,
				},
			});
			console.log(
				`User ${userId} has unlocked achievement: ${achievement.name}`,
			);
			return { isNewlyCompleted: true };
		}

		return { isNewlyCompleted: false };
	}

	async getUserAchievements(
		userId: string,
	): Promise<{ achievement: Achievement; unlockedTiers: number[] }[]> {
		const userAchievements = await this.prisma.userAchievement.findMany({
			where: { userId },
		});

		return Object.values(
			userAchievements.reduce(
				(acc, ua) => {
					const achievement = achievements.find(
						(a) => a.id === ua.achievementId,
					);
					if (achievement) {
						if (!acc[ua.achievementId]) {
							acc[ua.achievementId] = {
								achievement,
								unlockedTiers: [],
							};
						}
						if (ua.tier !== null) {
							acc[ua.achievementId].unlockedTiers.push(ua.tier);
						}
					}
					return acc;
				},
				{} as Record<
					string,
					{ achievement: Achievement; unlockedTiers: number[] }
				>,
			),
		);
	}

	async getUserProgress(
		userId: string,
	): Promise<(AchievementProgress & { achievement: Achievement })[]> {
		const progress = await this.prisma.achievementProgress.findMany({
			where: { userId },
		});

		return progress
			.map((p) => ({
				...p,
				// biome-ignore lint/style/noNonNullAssertion: <explanation>
				achievement: achievements.find((a) => a.id === p.achievementId)!,
			}))
			.filter((p) => p.achievement !== undefined);
	}

	async getAvailableAchievements(userId: string): Promise<Achievement[]> {
		const unlockedAchievements = await this.getUserAchievements(userId);

		return achievements.filter((a) => {
			const unlockedAchievement = unlockedAchievements.find(
				(ua) => ua.achievement.id === a.id,
			);
			if (!unlockedAchievement) return true;
			if (a.tiers && a.tiers.length > 0) {
				return unlockedAchievement.unlockedTiers.length < a.tiers.length;
			}
			return false; // Non-tiered achievement is already unlocked
		});
	}
}

export const achievementService = new AchievementService(prisma);
