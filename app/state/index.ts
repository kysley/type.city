import { atom, useSetAtom } from "jotai";
import { selectAtom, splitAtom } from "jotai/utils";
import { getWords } from "wordkit";

enum WordFinishState {
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

export const wordsAtomAtom = splitAtom(wordsAtom, (word) => word.key);

// export const wordHistory = atom<WordState[]>([]);

export const wordIndexAtom = atom(0);

export const inputAtom = atom("");

export const lineBreakCountAtom = atom(0);

export const hideWordsUnderIndexAtom = atom(0);

export const lineBreakIndicesAtom = atom<number[]>([]);

export function useResetTypingState() {
  const setWordsAtom = useSetAtom(wordsAtom);
  const setWordIndexAtom = useSetAtom(wordIndexAtom);
  const setInputAtom = useSetAtom(inputAtom);
  const setLineBreakCountAtom = useSetAtom(lineBreakCountAtom);
  const setHideUnderAtom = useSetAtom(hideWordsUnderIndexAtom);
  const setBreakIndicesAtom = useSetAtom(lineBreakIndicesAtom);

  function resetState() {
    setWordsAtom(
      getWords(250)
        .split(",")
        .map((word, index) => ({
          word,
          input: "",
          finishState: WordFinishState.UNFINISHED,
          key: index,
        }))
    );
    setWordIndexAtom(0);
    setInputAtom("");
    setLineBreakCountAtom(0);
    setHideUnderAtom(0);
    setBreakIndicesAtom([]);
  }

  return {
    resetState,
  };
}
