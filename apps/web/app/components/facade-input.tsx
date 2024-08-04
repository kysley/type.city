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
} from "../state";
import { ChangeEvent, forwardRef, KeyboardEvent } from "react";
import { useLocalClock } from "../hooks/use-local-clock";

export const FacadeInput = forwardRef<HTMLInputElement>(function FacadeInput(
  props,
  ref
) {
  const [input, setInput] = useAtom(inputAtom);
  const canBackspace = useAtomValue(canBackspaceAtom);
  const [gState, setGState] = useAtom(gStateAtom);

  const set = useSetAtom(currentWordAtom);
  const setWordIndex = useSetAtom(wordIndexAtom);
  const setCorrections = useSetAtom(correctionsAtom);
  const setAC = useSetAtom(actionsCountAtom);

  const { timer } = useLocalClock();

  function handleType(e: ChangeEvent<HTMLInputElement>) {
    if (timer.status !== "RUNNING" && gState !== GameState.PLAYING) {
      timer.start();
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
      value={input}
      onChange={handleType}
      onKeyDown={handleKeyDown}
      ref={ref}
      className="facade"
      // biome-ignore lint/a11y/noAutofocus: dont' tell me what to autofocus >:(
      autoFocus
    />
  );
});
