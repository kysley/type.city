import { PrimitiveAtom, useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  WordState,
  hideWordsUnderIndexAtom,
  inputAtom,
  lineAtom,
  lineBreakCountAtom,
  lineBreakIndicesAtom,
  useResetTypingState,
  wordIndexAtom,
  wordsAtomAtom,
} from "../state";
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

type WordListProps = {
  words: PrimitiveAtom<WordState>[];
};
export function WordList({ words }: WordListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // const [words, dispatch] = useAtom(wordsAtomAtom);
  const hideUnderIndex = useAtomValue(hideWordsUnderIndexAtom);
  const lineBreakCount = useAtomValue(lineBreakCountAtom);
  const { resetState } = useResetTypingState();
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    if (containerRef.current) {
      const $height = containerRef.current.children.item(0)?.clientHeight;
      console.log(height);
      setHeight($height * 3.5);
    }
    // setHeight(0);
  }, []);

  return (
    <>
      <FacadeInput ref={inputRef} />
      <div
        className={clsx("flex gap-2 w-[44vw] h-full flex-wrap")}
        style={{ height, overflow: "hidden" }}
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
            className={clsx(
              "word",
              "text-3xl",
              lineBreakCount >= 2 && index < hideUnderIndex && "hidden"
            )}
          >
            <Word wordAtom={word} />
          </p>
        ))}
        {height && <Cursor container={containerRef} />}
      </div>
      <button
        onClick={() => {
          resetState();
          inputRef.current?.focus();
        }}
      >
        reset
      </button>
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

  const secondLineY = useRef(0);

  const [breaks, setBreaks] = useAtom(lineBreakIndicesAtom);
  const [timesBroken, setTimesBroken] = useAtom(lineBreakCountAtom);
  const [hideUnder, setHideUnder] = useAtom(hideWordsUnderIndexAtom);

  useLayoutEffect(() => {
    if (container.current) {
      const words = Array.from(container.current.children) as HTMLDivElement[];

      const _breaks = [];

      let prevTop = 0;
      // Get upcoming breaks, skip words that have already been hidden for perf
      for (let i = hideUnder; i <= words.length - 1; ++i) {
        const offsetTop = words[i].offsetTop;
        if (offsetTop !== prevTop) {
          prevTop = offsetTop;
          // Simple perf: don't check too many lines in advance
          if (_breaks.length === 3) {
            break;
          }
          _breaks.push(i);
        }
      }
      // Remove the initial break value which should always be 0
      _breaks.shift();
      setBreaks(_breaks);
    }
    // We only care to run this effect when the user changes words
  }, [wordIndex]);

  useEffect(() => {
    let pastBreak = false;
    // if we haven't broke before, use the first value
    if (timesBroken === 0) {
      pastBreak = wordIndex >= breaks[0];
    } else {
      // use the coming break to hide the previous/current indices
      pastBreak = wordIndex >= breaks[1];
      if (pastBreak) setHideUnder(breaks[0]);
    }

    if (pastBreak) {
      setTimesBroken((p) => p + 1);
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

        // Keep the y value for the second line
        if (timesBroken === 1 && secondLineY.current === 0) {
          secondLineY.current = y;
        }

        setpos([vec1, vec2]);
      }
    }
  }, [val, wordIndex]);

  return (
    <div
      className="absolute h-8 w-0.5 bg-red-500"
      style={{ left: pos[0], top: pos[1], marginTop: 4 }}
    />
  );
}
