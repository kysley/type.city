import { useAtomValue, useSetAtom } from "jotai";
import { currentWordAtom, inputAtom, wordIndexAtom } from "../state";
import { useEffect, useRef } from "react";

function useSyncInput() {
  const wordIndex = useAtomValue(wordIndexAtom);
  const prevWordIndex = useRef(wordIndex);
  const setInput = useSetAtom(inputAtom);

  const currentWord = useAtomValue(currentWordAtom);

  useEffect(() => {
    // Check if the user has backspaced through a word. Checking if 51 (previous) is larger than 50 (current)
    // We need to do this so the user is editing exactly what they had before they hit space
    if (prevWordIndex.current > wordIndex && currentWord) {
      console.info("setting previous input", currentWord.input);
      setInput(currentWord.input);
    }

    prevWordIndex.current = wordIndex;
  }, [wordIndex, currentWord, setInput]);
}

export { useSyncInput };
