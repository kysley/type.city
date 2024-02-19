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
            className={clsx("text-lg", line > index && "hidden")}
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
  const [nextCutoff, setNextCutoff] = useState(0);
  const [breakCount, setBreakCount] = useState(0);
  const [prevCutoff, setPrevCutoff] = useState(0);
  const secondLineY = useRef(0);

  useEffect(() => {
    if (wordIndex === nextCutoff + prevCutoff + 1) {
      if (breakCount > 1) {
        console.log("setting cutoff");
        setLineAtom(nextCutoff);
        setPrevCutoff(nextCutoff);
      }
    }
  }, [wordIndex, nextCutoff]);

  // Cursor up/down
  useLayoutEffect(() => {
    if (container.current) {
      const word = container.current.children.item(wordIndex);

      // nextNEXTword
      const nextWord = container.current.children.item(wordIndex + 1);

      if (!word || !nextWord) return;

      const wordY = word.getBoundingClientRect().y;
      const { y: nextWordY, left: nextWordLeft } =
        nextWord.getBoundingClientRect();

      // If the next word is on a new line
      if (wordY !== nextWordY) {
        console.log(
          "setting new cutoff, existing:",
          prevCutoff,
          "next:",
          wordIndex + 1,
          nextWord.textContent
        );
        if (prevCutoff === 0) {
          setPrevCutoff(wordIndex + 1);
          setNextCutoff(wordIndex + 1 - prevCutoff);
        } else {
          setNextCutoff(wordIndex + 1 - prevCutoff);
        }
        // setBreakAt(wordIndex - breakAt);
        if (breakCount === 1) {
          secondLineY.current = wordY;
        }
        setBreakCount((p) => p + 1);
        // setpos((p) => [nextWordLeft, nextWordY]);
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
        const vec2 = secondLineY.current || y;

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
