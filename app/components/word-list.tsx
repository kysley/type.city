import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { inputAtom, lineAtom, wordIndexAtom, wordsAtomAtom } from "../state";
import {
  RefObject,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Word } from "./word";
import { FacadeInput } from "./facade-input";
import clsx from "clsx";

export function WordList() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [words, dispatch] = useAtom(wordsAtomAtom);
  const line = useAtomValue(lineAtom);

  // const cutWordAtoms = useMemo(() => {
  //   return words.slice(line, -1);
  // }, [line, words]);

  return (
    <>
      <FacadeInput ref={inputRef} />
      <div
        className={clsx("flex gap-2 w-full h-full flex-wrap")}
        ref={containerRef}
        onClick={() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }}
      >
        {words.map((word, index) => (
          <p
            key={word.toString()}
            className={clsx("text-lg", line - 2 > index && "hidden")}
          >
            <Word wordAtom={word} />
          </p>
        ))}
        <Cursor container={containerRef} />
      </div>
    </>
  );
}

export function Cursor({
  container,
}: {
  container: RefObject<HTMLDivElement>;
}) {
  const [wordIndex] = useAtom(wordIndexAtom);
  const [val] = useAtom(inputAtom);
  const [pos, setpos] = useState([0, 0]);

  const [linem, setLineAtom] = useAtom(lineAtom);
  const [breakAt, setBreakAt] = useState(0);
  const [breaks, setBreaks] = useState(0);

  // Cursor up/down
  useLayoutEffect(() => {
    if (container.current) {
      const word = container.current.children.item(wordIndex);

      // nextNEXTword
      const nextWord = container.current.children.item(wordIndex + 1);

      if (!word || !nextWord) return;

      const isLastLetter = val.length === word.children.length;
      const wordY = word.getBoundingClientRect().y;
      const { y: nextWordY, left: nextWordLeft } =
        nextWord.getBoundingClientRect();

      // If the next word is on a new line
      if (wordY !== nextWordY) {
        if (breaks + 1 >= 2) {
          console.log(breakAt);
          setLineAtom(breakAt);
        }
        setBreakAt(wordIndex + 2);
        setBreaks((p) => p + 1);
        setpos((p) => [nextWordLeft, nextWordY]);
      }
    }
  }, [wordIndex]);

  // Cursor left/right
  useLayoutEffect(() => {
    if (container.current) {
      const word = container.current.children.item(wordIndex);

      const nextWord = container.current.children.item(wordIndex + 1);

      let letter: Element | null = null;

      if (!word || !nextWord) return;

      const isLastLetter = val.length === word.children.length;

      // If the next word is on a new line
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
