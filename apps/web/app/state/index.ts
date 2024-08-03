import { atom, useSetAtom } from "jotai";
import { selectAtom, splitAtom } from "jotai/utils";
import { getWords } from "wordkit";
import { calculateAPM } from "../utils/wpm";

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

export const correctionsAtom = atom<number>(0);

export const wordsAtom = atom<WordState[]>(
  getWords(250)
    .split(",")
    .map((word, index) => ({
      word,
      input: "",
      finishState: WordFinishState.UNFINISHED,
      key: index,
    }))
);

export const currentWordAtom = atom(
  (get) => {
    const wordIndex = get(wordIndexAtom);
    const wordAtom = get(wordsAtomAtom)[wordIndex];
    return get(wordAtom);
  },
  (get, set, value: Partial<WordState>) => {
    const wordIndex = get(wordIndexAtom);
    const wordAtom = get(wordsAtomAtom)[wordIndex];
    const word = get(wordAtom);

    // If the word is the same, correct. if the length is NOT the same, unfinished, otherwise incorrect
    const finishState =
      word.word === value.input
        ? WordFinishState.CORRECT
        : word.word.length !== value.input?.length
        ? WordFinishState.UNFINISHED
        : WordFinishState.INCORRECT;

    set(wordAtom, { ...word, ...value, finishState });
  }
);

export const previousWordAtom = atom((get) => {
  const wordIndex = get(wordIndexAtom);
  const wordAtom = get(wordsAtomAtom)[wordIndex - 1];
  if (wordAtom) {
    return get(wordAtom);
  }
  return wordAtom;
});

export const canBackspaceAtom = selectAtom<WordState, boolean>(
  previousWordAtom,
  (word) => {
    if (!word) {
      return false;
    }
    return (
      word.finishState === WordFinishState.INCORRECT ||
      word.finishState === WordFinishState.UNFINISHED
    );
  }
);

export const apmAtom = atom((get) => {
  const actions = get(actionsCountAtom);
  const gTime = get(gTimeAtom);
  const gCondition = get(gModeConditionAtom);

  const time = gCondition - gTime;

  if (actions === 0) return 0;

  const apm = calculateAPM({ actions, time });

  return apm;
});

export const wordsAtomAtom = splitAtom(wordsAtom, (word) => word.key);

export const wordIndexAtom = atom(0);

export const inputAtom = atom("");

export const lineBreakCountAtom = atom(0);

export const hideWordsUnderIndexAtom = atom(0);

export const lineBreakIndicesAtom = atom<number[]>([]);

export const actionsCountAtom = atom(0);

// game time & game type

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

export enum GameState {
  WAITING = 0,
  PLAYING = 1,
  DONE = 2,
}

export const gModeTypeAtom = atom<GameMode>(GameMode.LIMIT);

/**
 * If the game mode is LIMIT this is the number of seconds remaining
 *
 * If the game mode is RACE this is the number of words remaining
 */
export const gModeConditionAtom = atom<number>(30 /*30 seconds*/);

/**
 * The duration of the current game
 */
export const gTimeAtom = atom(0);

export const gStateAtom = atom<GameState>(GameState.WAITING);

type RoomPlayerState = {
  id: string;
  apm: number;
  letterIndex: number;
  wordIndex: number;
};

type RoomState = {
  gameId?: string;
  players?: RoomPlayerState[];
};

export const gRoomStateAtom = atom<RoomState>({
  gameId: undefined,
  players: undefined,
});
