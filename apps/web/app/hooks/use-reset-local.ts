import { useSetAtom } from "jotai";
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
} from "../state";

export function useResetTypingState() {
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
    setGState(GameState.WAITING);
    setHideOverAtom({ cursorLimit: 0, wordLimit: 0 });
    setGTime(0);
    setActionCount(0);
    setCorrections(0);
  }

  return {
    resetState,
  };
}
