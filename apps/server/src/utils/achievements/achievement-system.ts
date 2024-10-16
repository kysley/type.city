import type { PrismaClient } from "@prisma/client";
import {
	type Achievement,
	type AchievementType,
	type AchievementProgress,
	achievements,
} from ".";
import { prisma } from "../../utils/prisma";

export interface AchievementUpdate {
	achievement: Achievement;
	newProgress: number;
	isNewlyCompleted: boolean;
}

class AchievementService {
	private prisma: PrismaClient;

	constructor(prisma: PrismaClient) {
		this.prisma = prisma;
	}

	async updateAchievementProgress(
		userId: string,
		type: AchievementType,
		increment = 1,
	): Promise<AchievementUpdate[]> {
		const updates: AchievementUpdate[] = [];
		const achievement = achievements.find((a) => a.type === type);
		if (!achievement) {
			throw new Error(`Achievement of type ${type} not found`);
		}

		const userAlreadyHas = await prisma.userAchievement.findUnique({
			where: {
				userId_achievementId: {
					userId: userId,
					achievementId: achievement.id,
				},
			},
		});

		if (userAlreadyHas) {
			return updates;
		}

		if (achievement.dependsOn && achievement.dependsOn.length > 0) {
			const unlockedAchievements = await this.getUserAchievements(userId);
			const dependenciesMet = achievement.dependsOn.every((depId) =>
				unlockedAchievements.some((ua) => ua.id === depId),
			);

			if (!dependenciesMet) {
				console.log(
					`Dependencies not met for achievement: ${achievement.name}`,
				);
				return updates;
			}
		}

		const result = await this.prisma.achievementProgress.upsert({
			where: {
				userId_achievementId: {
					userId,
					achievementId: achievement.id,
				},
			},
			update: {
				currentProgress: {
					increment,
				},
			},
			create: {
				userId,
				achievementId: achievement.id,
				currentProgress: increment,
			},
		});

		const isNewlyCompleted = await this.checkAchievementCompletion(
			userId,
			achievement.id,
		);
		updates.push({
			achievement,
			newProgress: result.currentProgress,
			isNewlyCompleted,
		});

		if (isNewlyCompleted) {
			const dependentUpdates = await this.checkDependentAchievements(
				userId,
				achievement.id,
			);
			updates.push(...dependentUpdates);
		}

		return updates;
	}

	private async checkAchievementCompletion(
		userId: string,
		achievementId: string,
	): Promise<boolean> {
		const progress = await this.prisma.achievementProgress.findUnique({
			where: {
				userId_achievementId: {
					userId,
					achievementId,
				},
			},
		});

		const achievement = achievements.find((a) => a.id === achievementId);

		if (
			progress &&
			achievement &&
			progress.currentProgress >= achievement.requiredProgress
		) {
			const created = await this.prisma.userAchievement.upsert({
				create: {
					userId,
					achievementId,
				},
				update: {},
				where: {
					userId_achievementId: {
						achievementId,
						userId,
					},
				},
			});

			if (created) {
				console.log(
					`User ${userId} has unlocked achievement: ${achievement.name}`,
				);
				return true;
			}
		}

		return false;
	}

	private async checkDependentAchievements(
		userId: string,
		completedAchievementId: string,
	): Promise<AchievementUpdate[]> {
		const updates: AchievementUpdate[] = [];
		const dependentAchievements = achievements.filter((a) =>
			a.dependsOn?.includes(completedAchievementId),
		);

		for (const achievement of dependentAchievements) {
			const dependentUpdates = await this.updateAchievementProgress(
				userId,
				achievement.type,
			);
			updates.push(...dependentUpdates);
		}

		return updates;
	}

	async getUserAchievements(userId: string): Promise<Achievement[]> {
		const userAchievements = await this.prisma.userAchievement.findMany({
			where: { userId },
			select: { achievementId: true },
		});

		return achievements.filter((a) =>
			userAchievements.some((ua) => ua.achievementId === a.id),
		);
	}

	async getUserProgress(userId: string): Promise<AchievementProgress[]> {
		return this.prisma.achievementProgress.findMany({
			where: { userId },
		});
	}

	async getAvailableAchievements(userId: string): Promise<Achievement[]> {
		const unlockedAchievements = await this.getUserAchievements(userId);
		const unlockedIds = new Set(unlockedAchievements.map((a) => a.id));

		return achievements.filter((a) => {
			if (unlockedIds.has(a.id)) return false;
			if (!a.dependsOn) return true;
			return a.dependsOn.every((depId) => unlockedIds.has(depId));
		});
	}
}

export const achievementService = new AchievementService(prisma);
