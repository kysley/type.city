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
