import { atom } from "jotai";
import { selectAtom, splitAtom } from "jotai/utils";
import { getWords } from "wordkit";

enum WordFinishState {
  CORRECT,
  FLAWLESS,
  INCORRECT,
  UNFINISHED,
}

export type WordState = {
  word: string;
  input: string;
  finishState: WordFinishState;
  key: number;
};

export const mistakesAtom = atom<number>(0);

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
    return wordAtom;
  },
  (get, set, value: Partial<WordState>) => {
    const wordIndex = get(wordIndexAtom);
    const wordAtom = get(wordsAtomAtom)[wordIndex];
    const word = get(wordAtom);
    set(wordAtom, { ...word, ...value });
  }
);

export const wordsAtomAtom = splitAtom(wordsAtom, (word) => word.key);

// export const wordHistory = atom<WordState[]>([]);

export const wordIndexAtom = atom(0);

export const inputAtom = atom("");

export const lineAtom = atom(0);
