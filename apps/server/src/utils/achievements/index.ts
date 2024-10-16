export enum AchievementType {
	PLAY_RACE_GAMES = "PLAY_RACE_GAMES",
	PLAY_RACE_GAMES_2 = "PLAY_RACE_GAMES_2",
	PLAY_LIMIT_GAMES = "PLAY_LIMIT_GAMES",
	PERFECT_TESTS = "PERFECT_TESTS",
	PLAY_MULTIPLAYER = "PLAY_MULTIPLAYER",
	MASTER_TYPER = "MASTER_TYPER",
}

export interface Achievement {
	id: string;
	type: AchievementType;
	name: string;
	description: string;
	requiredProgress: number;
	dependsOn?: string[]; // IDs of achievements that must be completed first
}

export interface AchievementProgress {
	userId: string;
	achievementId: string;
	currentProgress: number;
}

export const achievements: Achievement[] = [
	{
		id: "1",
		type: AchievementType.PLAY_RACE_GAMES,
		name: "Race Enthusiast",
		description: "Play 5 Race games",
		requiredProgress: 5,
	},
	{
		id: "2",
		type: AchievementType.PLAY_LIMIT_GAMES,
		name: "Limit Master",
		description: "Play 5 Limit games",
		requiredProgress: 5,
	},
	{
		id: "3",
		type: AchievementType.PERFECT_TESTS,
		name: "Perfectionist",
		description: "Finish 15 tests perfectly",
		requiredProgress: 15,
	},
	{
		id: "4",
		type: AchievementType.PLAY_MULTIPLAYER,
		name: "Social Typer",
		description: "Play a multiplayer game",
		requiredProgress: 1,
	},
	{
		id: "5",
		type: AchievementType.PLAY_MULTIPLAYER,
		name: "Social Typer",
		description: "Play a multiplayer game",
		requiredProgress: 1,
	},
];
