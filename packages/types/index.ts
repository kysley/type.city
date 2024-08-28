export enum GameMode {
  /**
   * The user has N seconds to type as many words as possible
   */
  LIMIT = 0,
  /**
   * The user types N number of words as fast as possible
   * */
  RACE = 1,
}

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
};

export enum WordFinishState {
  CORRECT = 0,
  FLAWLESS = 1,
  INCORRECT = 2,
  UNFINISHED = 3,
}

export type WordState = {
  word: string;
  input: string;
  finishState: WordFinishState;
  key: number;
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
};
