import { useAtom, useSetAtom } from "jotai";
import {
  currentWordAtom,
  inputAtom,
  correctionsAtom,
  wordIndexAtom,
} from "../state";
import {
  ChangeEvent,
  KeyboardEventHandler,
  forwardRef,
  KeyboardEvent,
} from "react";

export const FacadeInput = forwardRef<HTMLInputElement>(function FacadeInput(
  props,
  ref
) {
  const [input, setInput] = useAtom(inputAtom);
  const [wordIndex, setWordIndex] = useAtom(wordIndexAtom);
  const set = useSetAtom(currentWordAtom);
  const setCorrections = useSetAtom(correctionsAtom);

  function handleType(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.value.slice(-1) === " " && input !== "") {
      setInput("");
      setWordIndex(wordIndex + 1);
    } else {
      const trimmedInput = e.target.value.trim();
      set({ input: trimmedInput });
      setInput(trimmedInput);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      setCorrections((p) => p + 1);
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
