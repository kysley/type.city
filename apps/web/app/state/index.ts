import { atom } from "jotai";
import { selectAtom, splitAtom } from "jotai/utils";
import { atomWithStorage } from "jotai/utils";
import { calculateAPM, calculateWPM } from "../utils/wpm";
import type { RoomPlayerState, Room } from "types";

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

export function addStateToWord(word: string, idx: number): WordState {
  return {
    word,
    input: "",
    finishState: WordFinishState.UNFINISHED,
    key: idx,
  };
}

export const wordsAtom = atom<WordState[]>(
  []
  // [addStateToWord("", 0)]
  // getWords(1).split(",").map(addStateToWord)
);

export const currentWordAtom = atom(
  (get) => {
    const wordIndex = get(wordIndexAtom);
    const wordAtom = get(wordsAtomAtom)[wordIndex];
    // If last word in the set
    if (!wordAtom) {
      return undefined;
    }
    return get(wordAtom);
  },
  (get, set, value: Partial<WordState>) => {
    const wordIndex = get(wordIndexAtom);
    const wordAtom = get(wordsAtomAtom)[wordIndex];

    // If last word in the set
    if (!wordAtom) {
      return;
    }

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
  const gCondition = get(gConditionAtom);

  const time = gCondition - gTime;

  if (actions === 0) return 0;

  const apm = calculateAPM({ actions, time });

  return apm;
});

export const wpmAtom = atom((get) => {
  const index = get(wordIndexAtom);
  const corrections = get(correctionsAtom);
  const gTime = get(gTimeAtom);
  const gCondition = get(gConditionAtom);
  const gMode = get(gModeTypeAtom);
  let time: number;

  if (gMode === GameMode.LIMIT) {
    time = gCondition - gTime;
  } else {
    time = gTime;
  }

  const words = get(wordsAtom);

  const wpm = calculateWPM({
    index,
    mistakes: corrections,
    time,
    wordsState: words,
  });

  return wpm;
});

export const wordsAtomAtom = splitAtom(wordsAtom, (word) => word.key);

export const wordIndexAtom = atom(0);

export const inputAtom = atom("");

export const lineBreakCountAtom = atom(0);

export const hideWordsUnderIndexAtom = atom(0);
export const hideWordsOverIndexAtom = atom({ wordLimit: 0, cursorLimit: 0 });

export const lineBreakIndicesAtom = atom<number[]>([]);

export const actionsCountAtom = atom(0);

export const refocusAtom = atom(0);
export const focusAtom = atom(true);

export const snapshotAtom = atom((get) => {
  const apm = get(apmAtom);
  const wordIndex = get(wordIndexAtom);
  const words = get(wordsAtom);
  const corrections = get(correctionsAtom);
  const wpm = get(wpmAtom);

  return {
    apm,
    wordIndex,
    words,
    corrections,
    ...wpm,
  };
});

export const cursorAtom = atomWithStorage("t2024_cursor", "0", undefined, {
  getOnInit: true,
});

export const userbarAtom = atomWithStorage("t2024_ub", "0", undefined, {
  getOnInit: true,
});

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

export const gModeTypeAtom = atomWithStorage<GameMode>(
  "t2024_mode",
  GameMode.LIMIT,
  undefined,
  { getOnInit: true }
);

/**
 * If the game mode is LIMIT this is the number of seconds remaining
 *
 * If the game mode is RACE this is the number of words remaining
 */
export const gModeConditionAtom = atomWithStorage<Record<GameMode, number>>(
  "t2024_condition",
  { [GameMode.LIMIT]: 60, [GameMode.RACE]: 25 },
  undefined,
  { getOnInit: true }
);

export const gConditionAtom = atom<number>((get) => {
  const conditions = get(gModeConditionAtom);
  const mode = get(gModeTypeAtom);

  return conditions[mode];
});

/**
 * The duration of the current game
 */
export const gTimeAtom = atom(0);

export const gStateAtom = atom<GameState>(GameState.WAITING);

export const gSnapshotAtom = atom();

export const gRoomStateAtom = atom<Room | undefined>();

export const gRoomUsers = atom<RoomPlayerState[] | []>(
  (get) => get(gRoomStateAtom)?.players || []
);

export const gRoomBusAtom = atom<string[]>([]);
