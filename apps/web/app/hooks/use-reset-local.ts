import { useAtomValue, useSetAtom } from "jotai";
import { getWords } from "wordkit";
import {
  wordsAtom,
  wordIndexAtom,
  inputAtom,
  lineBreakCountAtom,
  hideWordsUnderIndexAtom,
  lineBreakIndicesAtom,
  WordFinishState,
  gStateAtom,
  gTimeAtom,
  GameState,
  actionsCountAtom,
  hideWordsOverIndexAtom,
  correctionsAtom,
  refocusAtom,
  gModeConditionAtom,
  gModeTypeAtom,
  GameMode,
} from "../state";

export function useResetTypingState() {
  // {
  // includeWords = true,
  // resetWords = false,
  // includeTime = true,
  // includeState = true,
  // } = {
  // if things start being weird its cause of this
  // includeWords: true,
  // resetWords: false,
  // includeTime: true,
  // includeState: true,
  // }
  const gCondition = useAtomValue(gModeConditionAtom);
  const gMode = useAtomValue(gModeTypeAtom);

  const setWordsAtom = useSetAtom(wordsAtom);
  const setWordIndexAtom = useSetAtom(wordIndexAtom);
  const setInputAtom = useSetAtom(inputAtom);
  const setLineBreakCountAtom = useSetAtom(lineBreakCountAtom);
  const setHideUnderAtom = useSetAtom(hideWordsUnderIndexAtom);
  const setHideOverAtom = useSetAtom(hideWordsOverIndexAtom);
  const setBreakIndicesAtom = useSetAtom(lineBreakIndicesAtom);
  const setGState = useSetAtom(gStateAtom);
  const setGTime = useSetAtom(gTimeAtom);
  const setActionCount = useSetAtom(actionsCountAtom);
  const setCorrections = useSetAtom(correctionsAtom);
  const setRefocus = useSetAtom(refocusAtom);

  const generateManyWords = gMode === GameMode.LIMIT;

  // If the test is a Race, generate the number of words based off the condition
  // otherwise, 250 is a lot for the time being
  const numWordsToGenerate = generateManyWords ? 250 : gCondition;

  function resetState({
    includeWords = true,
    resetWords = false,
    includeTime = true,
    includeState = true,
  } = {}) {
    if (includeWords) {
      if (resetWords) {
        setWordsAtom((p) =>
          p.map((word, index) => ({
            ...word,
            input: "",
            finishState: WordFinishState.UNFINISHED,
          }))
        );
      } else {
        setWordsAtom(
          getWords(numWordsToGenerate)
            .split(",")
            .map((word, index) => ({
              word,
              input: "",
              finishState: WordFinishState.UNFINISHED,
              key: index,
            }))
        );
      }
    }
    setWordIndexAtom(0);
    setInputAtom("");
    setLineBreakCountAtom(0);
    setHideUnderAtom(0);
    setBreakIndicesAtom([]);
    if (includeState) {
      setGState(GameState.WAITING);
    }
    setHideOverAtom({ cursorLimit: 0, wordLimit: 0 });
    if (includeTime) {
      setGTime(0);
    }
    setActionCount(0);
    setCorrections(0);
    setRefocus((p) => p + 1);
  }

  return {
    resetState,
  };
}
