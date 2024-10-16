export enum GameMode {
	/**
	 * The user has N seconds to type as many words as possible
	 */
	LIMIT = 0,
	/**
	 * The user types N number of words as fast as possible
	 * */
	RACE = 1,
	/**
	 * The user participates in multiple races.
	 */
	RELAY = 2,
}

export const gameModeName: Record<GameMode, string> = {
	[GameMode.RELAY]: "Relay",
	[GameMode.LIMIT]: "Duration",
	[GameMode.RACE]: "Words",
};

export type RoomPlayerState = {
	id: string;
	apm: number;
	letterIndex: number;
	wordIndex: number;
	userbarId?: string;
	cursorId?: string;
	isReady: boolean;
};

export enum RoomState {
	LOBBY = 0,
	STARTING = 1,
	IN_PROGRESS = 2,
	GAME_OVER = 3,
}

export type Room = {
	gameId: string;
	players: RoomPlayerState[];
	words: string[];
	state: RoomState;
	mode: GameMode;
	condition: number;
	meta?: unknown;
};

export type RoomRelayMeta = {
	legs: number;
	leg: number;
	legWords?: string[];
};

export enum WordFinishState {
	CORRECT = 0,
	FLAWLESS = 1,
	INCORRECT = 2,
	UNFINISHED = 3,
}

export enum ServerEvents {
	/**
	 * SSE for room creation success
	 */
	ROOM_CREATED = "ROOM_CREATED",
	/**
	 * SSE for room join success
	 */
	ROOM_JOIN = "ROOM_JOIN",
	/**
	 * SSE for room state update
	 */
	ROOM_UPDATE = "ROOM_UPDATE",
	/**
	 * SSE for room chat update
	 */
	ROOM_BUS = "ROOM_BUS",
	/**
	 * Server sent event for game countdown value
	 */
	ROOM_COUNTDOWN = "ROOM_COUNTDOWN",
}

export enum ClientEvents {
	/**
	 * CSE for room creation request
	 */
	ROOM_CREATE = "ROOM_CREATE",
	/**
	 * CSE for client state update
	 */
	UPDATE = "UPDATE",
	/**
	 * CSE for client readying up in room
	 */
	READY = "READY",

	/**
	 * CSE for client trying to join a room
	 */
	ROOM_JOIN = "ROOM_JOIN",
}

export enum WordVariant {
	FOG = 0,
}

export type WordState = {
	word: string;
	input: string;
	finishState: WordFinishState;
	key: number;
	backspaced: boolean;
};

export type ArcadeWordState = WordState & {
	variant: WordVariant;
};

// You might not need tRPC
// Shared types package, update types and your monorepo gets updates
// no compile (try to use dts? d.ts?)
// example with zod on frontend and backend

export type ResultSubmission = {
	startTime: number;
	mode: GameMode;
	condition: number;
	state: WordState[];
	wordIndex: number;
	wpm: number;
	accuracy: number;
};

export type ResultResponse = {
	valid: boolean;
	level: number;
	gainxp: number;
	levelup: boolean;
};

type PlayerProgress = {
	level: number;
	xp: number;
};

export const xpSystem = {
	// Calculate XP required for a given level
	// biome-ignore lint/style/useExponentiationOperator: don't agree
	xpForLevel: (level: number): number => Math.floor(100 * Math.pow(level, 1.5)),

	// Calculate XP for a single word
	calculateWordXP: (type: WordFinishState): number => {
		switch (type) {
			case WordFinishState.CORRECT:
				return 1;
			case WordFinishState.FLAWLESS:
				return 1.5;
			default:
				return 0;
		}
	},

	// Calculate XP for a typing session
	calculateSessionXP: (wordCounts: Record<WordFinishState, number>): number => {
		return Array.from(Object.entries(wordCounts)).reduce(
			(totalXP, [type, count]) =>
				totalXP + xpSystem.calculateWordXP(Number(type)) * count,
			0,
		);
	},

	addXP: (state: PlayerProgress, amount: number): PlayerProgress => {
		let { xp, level } = state;
		xp += amount;

		while (xp >= xpSystem.xpForLevel(level + 1)) {
			xp -= xpSystem.xpForLevel(level + 1);
			level++;
			console.log(`a player leveled up to ${level}!`);
		}

		return { ...state, xp, level };
	},

	// Get XP required for next level
	getXPForNextLevel: (state: PlayerProgress): number =>
		xpSystem.xpForLevel(state.level + 1),

	// Get XP progress towards next level
	getXPProgress: (
		state: PlayerProgress,
	): { current: number; required: number } => ({
		current: state.xp,
		required:
			xpSystem.xpForLevel(state.level + 1) - xpSystem.xpForLevel(state.level),
	}),
};
