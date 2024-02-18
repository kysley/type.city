import { useAtom } from "jotai";
import { inputAtom, wordIndexAtom, wordsAtomAtom } from "../state";
import { useEffect, useRef, useState } from "react";
import { Word } from "./word";
import { FacadeInput } from "./facade-input";

export function WordList() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [words, dispatch] = useAtom(wordsAtomAtom);

  return (
    <>
      <FacadeInput ref={inputRef} />
      <div
        className="flex gap-2 w-full h-full flex-wrap"
        ref={containerRef}
        onClick={() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }}
      >
        {words.map((word) => (
          <p key={word.toString()}>
            <Word wordAtom={word} />
          </p>
        ))}
        <Cursor container={containerRef} />
      </div>
    </>
  );
}

export function Cursor({ container }) {
  const [wordIndex] = useAtom(wordIndexAtom);
  const [val] = useAtom(inputAtom);
  const [pos, setpos] = useState([0, 0]);

  useEffect(() => {
    if (container.current) {
      const word = container.current.children.item(wordIndex);

      let letter: Element | null;

      if (!word) return;
      console.log(word, val.length, val.length === word.children.length);

      const isLastLetter = val.length === word.children.length;

      letter = word.children.item(isLastLetter ? val.length - 1 : val.length);

      if (letter) {
        const { left, right, y } = letter.getBoundingClientRect();

        const vec1 = !isLastLetter ? left : right;
        const vec2 = y;

        setpos([vec1, vec2]);
      }
    }
  }, [val, wordIndex]);

  return (
    <div
      className="absolute h-6 w-0.5 bg-red-500 "
      style={{ left: pos[0], top: pos[1] }}
    />
  );
}
