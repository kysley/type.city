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
	isDone: boolean;
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
	seed: number;
	eslapsed: number;
	corrections: number;
};

export type ResultResponse = {
	valid: boolean;
	levelInfo: LevelInfo;
	xpGain: number;
	levelUp: boolean;
};

export function getWordGenCount(mode: GameMode, condition: number) {
	if (mode === GameMode.LIMIT) {
		return 300;
	}

	return condition;
}

export function validateResults(
	submission: ResultSubmission,
	serverSeed: number,
) {
	const {
		accuracy,
		condition,
		mode,
		seed,
		startTime,
		state,
		wordIndex,
		wpm,
		eslapsed,
		corrections,
	} = submission;
	const wordCounts = submission.state.reduce<Record<WordFinishState, number>>(
		(acc, cur) => {
			acc[cur.finishState] += 1;
			return acc;
		},
		{
			[WordFinishState.CORRECT]: 0,
			[WordFinishState.INCORRECT]: 0,
			[WordFinishState.FLAWLESS]: 0,
			[WordFinishState.UNFINISHED]: 0,
		},
	);
	console.log(wordCounts);

	const { acc: serverAccuracy, wpm: serverWpm } = calculateWPM({
		index: wordIndex,
		mistakes: corrections,
		time: eslapsed,
		wordsState: state,
	});

	if (serverAccuracy !== accuracy || serverWpm !== wpm) {
		return { valid: false, reason: "Invalid acc or wpm" };
	}

	if (serverSeed !== seed) {
		return { valid: false, reason: "Invalid seed" };
	}

	return { valid: true };
}

export function calculateWPM({
	index,
	time,
	wordsState,
	mistakes,
}: {
	index: number;
	time: number;
	wordsState: WordState[];
	mistakes: number;
}) {
	let correctLetters = 0;
	let incorrectLetters = 0;

	for (let i = 0; i <= index; i++) {
		const word = wordsState[i];
		if (!word) break;
		// if (word.perfect) correctLetters += word.name.length;

		word.word.split("").forEach((letter, index) => {
			// Check if the user has typed this far into the word
			if (word.input[index]) {
				// Correct letter
				if (word.input[index] === letter) {
					correctLetters += 1;
					// Incorrect letter
				} else {
					incorrectLetters += 1;
				}
			}
		});

		// Check the previous word if the user has either typed too many or too few letters
		// this is incorrect based on what you are supposed to type
		// therefore we count it towards accuracy as a more progressive calculation
		// Only check the previous word so live stats are not skewed towards not finishing the word yet
		// todo: will need to check the last word when checking a final submission
		const prevWord = wordsState[i - 1];
		if (prevWord) {
			if (prevWord.input.length !== prevWord.word.length) {
				incorrectLetters += Math.abs(
					prevWord.word.length - prevWord.input.length,
				);
			}
		}
	}

	const wpm = Math.round(((correctLetters + index) * (60 / time)) / 5);
	const total = correctLetters + index + incorrectLetters + mistakes;
	const acc = (1 - (incorrectLetters + mistakes) / total) * 100;

	return { wpm, acc };
}

type LevelInfo = {
	/** Current level */
	level: number;
	/** XP in current level */
	levelXP: number;
	/** Total amount of XP */
	totalXP: number;
	/** XP needed for next level */
	xpToNextLevel: number;
	/** Percent completion of current level */
	levelProgress: number;
};
class LevelingSystem {
	private readonly BASE_XP: number = 100;
	private readonly XP_MULTIPLIER: number = 1.5;

	public getLevelInfo(totalXP: number): LevelInfo {
		let level = 1;
		let previousLevelTotalXP = 0;
		let currentLevelXPNeeded = this.BASE_XP;

		// Find current level
		while (totalXP >= previousLevelTotalXP + currentLevelXPNeeded) {
			previousLevelTotalXP += currentLevelXPNeeded;
			level++;
			currentLevelXPNeeded = this.getXPForLevel(level);
		}

		// Calculate XP within current level
		const levelXP = totalXP - previousLevelTotalXP;

		// Calculate progress percentage
		const levelProgress = (levelXP / currentLevelXPNeeded) * 100;

		return {
			level,
			levelXP,
			totalXP,
			xpToNextLevel: currentLevelXPNeeded - levelXP,
			levelProgress,
		};
	}

	public getXPForLevel(level: number): number {
		// biome-ignore lint/style/useExponentiationOperator: who would want this?
		return Math.floor(this.BASE_XP * Math.pow(this.XP_MULTIPLIER, level - 1));
	}

	public getTotalXPForLevel(targetLevel: number): number {
		let totalXP = 0;
		for (let level = 1; level < targetLevel; level++) {
			totalXP += this.getXPForLevel(level);
		}
		return totalXP;
	}
}

export const levelSystem = new LevelingSystem();
