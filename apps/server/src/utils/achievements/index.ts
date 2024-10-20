export enum AchievementType {
	PLAY_RACE_GAMES = "PLAY_RACE_GAMES",
	PLAY_RACE_GAMES_2 = "PLAY_RACE_GAMES_2",
	PLAY_LIMIT_GAMES = "PLAY_LIMIT_GAMES",
	PERFECT_TESTS = "PERFECT_TESTS",
	PLAY_MULTIPLAYER = "PLAY_MULTIPLAYER",
	MASTER_TYPER = "MASTER_TYPER",
	DAILY = "DAILY",
}

export interface AchievementTier {
	tier: number;
	name: string;
	description: string;
	requiredValue: number;
}

export interface Achievement {
	id: string;
	type: string;
	name: string;
	description: string;
	tiers?: AchievementTier[];
	requiredValue?: number; // non-tiered
}

export interface AchievementUpdate {
	achievement: Achievement;
	newProgress: number;
	newTier?: number;
	isNewlyCompleted: boolean;
}

export const achievements: Achievement[] = [
	{
		id: "1_race",
		type: AchievementType.PLAY_RACE_GAMES,
		name: "Gotta go fast",
		description: "Play Race games",
		tiers: [
			{
				name: "No crashes",
				description: "Play 5 Race games",
				requiredValue: 5,
				tier: 1,
			},
			{
				name: "Track time",
				description: "Play 15 Race games",
				requiredValue: 15,
				tier: 2,
			},
		],
	},
	{
		id: "2_limit",
		type: AchievementType.PLAY_LIMIT_GAMES,
		name: "Stopwatch",
		description: "Play 5 Limit games",
		tiers: [
			{
				name: "Time's up!",
				description: "Play 5 Time Limit games",
				requiredValue: 5,
				tier: 1,
			},
			{
				name: "Watch the clock",
				description: "Play 15 Time Limit games",
				requiredValue: 15,
				tier: 2,
			},
		],
	},
	{
		id: "3_perfect",
		type: AchievementType.PERFECT_TESTS,
		name: "Perfectionist",
		description: "Finish 15 tests perfectly",
		requiredValue: 15,
	},
	{
		id: "4_heyguy",
		type: AchievementType.PLAY_MULTIPLAYER,
		name: "Yo add me on type city",
		description: "Play a multiplayer game",
		requiredValue: 1,
	},
	{
		id: "5_paperboy",
		type: AchievementType.DAILY,
		name: "Paper boy",
		description: "Play a Daily game",
		requiredValue: 1,
	},
];
