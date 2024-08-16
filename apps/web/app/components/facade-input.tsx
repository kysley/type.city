import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  currentWordAtom,
  inputAtom,
  correctionsAtom,
  wordIndexAtom,
  canBackspaceAtom,
  actionsCountAtom,
  gStateAtom,
  GameState,
  refocusAtom,
  focusAtom,
} from "../state";
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

export function FacadeInput({ canType = true }) {
  const ref = useRef<HTMLInputElement>(null);

  const setHasFocus = useSetAtom(focusAtom);

  const [input, setInput] = useAtom(inputAtom);
  const [gState, setGState] = useAtom(gStateAtom);

  const refocus = useAtomValue(refocusAtom);
  const canBackspace = useAtomValue(canBackspaceAtom);

  const set = useSetAtom(currentWordAtom);
  const setWordIndex = useSetAtom(wordIndexAtom);
  const setCorrections = useSetAtom(correctionsAtom);
  const setAC = useSetAtom(actionsCountAtom);

  // biome-ignore lint/correctness/useExhaustiveDependencies: only want to run when we get refocus signal
  useEffect(() => {
    console.log("focusing input");
    ref.current?.focus();
    setHasFocus(true);
  }, [refocus]);

  function handleType(e: ChangeEvent<HTMLInputElement>) {
    if (!canType) return;

    if (gState === GameState.WAITING) {
      setGState(GameState.PLAYING);
    }

    if (e.target.value.slice(-1) === " " && input !== "") {
      console.info("[Word + Space] word complete");
      set({ input: e.target.value.trim() });
      setInput("");
      setWordIndex((p) => p + 1);
      setAC((p) => p + 1);
    } else {
      const trimmedInput = e.target.value.trim();
      set({ input: trimmedInput });
      setInput(trimmedInput);
      setAC((p) => p + 1);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!canType) return;
    // testing: Count every stroke as an action
    if (e.key === " ") {
      setAC((p) => p + 1);
    }
    if (e.shiftKey) {
      setAC((p) => p + 1);
    }
    if (e.key === "Backspace") {
      if (input.length !== 0) {
        setAC((p) => p + 1);
        console.info("[Backspace] User correction");
        setCorrections((p) => p + 1);
      }
      // Let the user backspace if the previous word allows- and if their input is empty
      if (canBackspace && input.length === 0) {
        setAC((p) => p + 1);
        setWordIndex((p) => p - 1);
      }
    }
  }

  return (
    <input
      type="text"
      autoCorrect="off"
      spellCheck="false"
      value={input}
      onChange={handleType}
      onKeyDown={handleKeyDown}
      // onBlur={() => setHasFocus(false)}
      ref={ref}
      className="facade"
      // biome-ignore lint/a11y/noAutofocus: dont' tell me what to autofocus >:(
      autoFocus
    />
  );
}
