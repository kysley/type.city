import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  currentWordAtom,
  inputAtom,
  correctionsAtom,
  wordIndexAtom,
  canBackspaceAtom,
} from "../state";
import { ChangeEvent, forwardRef, KeyboardEvent } from "react";

export const FacadeInput = forwardRef<HTMLInputElement>(function FacadeInput(
  props,
  ref
) {
  const [input, setInput] = useAtom(inputAtom);
  const [, setWordIndex] = useAtom(wordIndexAtom);
  const set = useSetAtom(currentWordAtom);
  const setCorrections = useSetAtom(correctionsAtom);
  const canBackspace = useAtomValue(canBackspaceAtom);

  function handleType(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.value.slice(-1) === " " && input !== "") {
      console.info("[Word + Space] word complete");
      set({ input: e.target.value.trim() });
      setInput("");
      setWordIndex((p) => p + 1);
    } else {
      const trimmedInput = e.target.value.trim();
      set({ input: trimmedInput });
      setInput(trimmedInput);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (input.length !== 0) {
        console.info("[Backspace] User correction");
        setCorrections((p) => p + 1);
      }
      // Let the user backspace if the previous word allows- and if their input is empty
      if (canBackspace && input.length === 0) {
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
      className="h-0 w-0 opacity-0 border-none"
      // biome-ignore lint/a11y/noAutofocus: dont' tell me what to autofocus >:(
      autoFocus
    />
  );
});
