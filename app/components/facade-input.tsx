import { useAtom } from "jotai";
import { currentWordAtom, inputAtom, wordIndexAtom } from "../state";
import { ChangeEvent, forwardRef } from "react";

export const FacadeInput = forwardRef<HTMLInputElement>(function FacadeInput(
  props,
  ref
) {
  const [input, setInput] = useAtom(inputAtom);
  const [wordIndex, setWordIndex] = useAtom(wordIndexAtom);
  const [currentWord, set] = useAtom(currentWordAtom);

  function handleType(e: ChangeEvent<HTMLInputElement>) {
    set({ input: e.target.value });
    if (e.target.value.slice(-1) === " ") {
      console.log("space");
      setInput("");
      setWordIndex(wordIndex + 1);
    } else {
      setInput(e.target.value);
    }
  }

  return <input value={input} onChange={handleType} ref={ref} />;
});
