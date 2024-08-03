import { PrimitiveAtom, useAtom, useAtomValue } from "jotai";
import {
  WordState,
  hideWordsUnderIndexAtom,
  inputAtom,
  lineBreakCountAtom,
  lineBreakIndicesAtom,
  wordIndexAtom,
} from "../state";
import {
  RefObject,
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Word } from "./word";
import { FacadeInput } from "./facade-input";
import clsx from "clsx";
import { useResetTypingState } from "../hooks/use-reset-local";

export function WordComposition({ words }: WordListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    if (containerRef.current) {
      const $height = containerRef.current.children.item(0)?.clientHeight;
      console.log(height);
      setHeight($height * 4.5);
    }
    // setHeight(0);
  }, []);

  return (
    <div>
      <WordList ref={containerRef} words={words} height={height} />
      {height && <Cursor container={containerRef} />}
    </div>
  );
}

type WordListProps = {
  words: PrimitiveAtom<WordState>[];
  height?: number;
};
export const WordList = forwardRef<HTMLDivElement, WordListProps>(
  function WordList({ words, height }, container) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { resetState } = useResetTypingState();

    const [breaks, setBreaks] = useAtom(lineBreakIndicesAtom);
    const [timesBroken, setTimesBroken] = useAtom(lineBreakCountAtom);
    const [hideUnder, setHideUnder] = useAtom(hideWordsUnderIndexAtom);

    const [wordIndex] = useAtom(wordIndexAtom);

    useLayoutEffect(() => {
      if (container.current) {
        const words = Array.from(
          container.current.children
        ) as HTMLDivElement[];

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

    return (
      <>
        <FacadeInput ref={inputRef} />
        <div
          style={{ height, overflow: "hidden" }}
          className={clsx("flex gap-[1.25rem] w-[66vw] h-full flex-wrap")}
          ref={container}
          onClick={() => {
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }}
        >
          {words.map((word, index) => (
            <Word
              key={word.toString()}
              wordAtom={word}
              className={clsx(
                "word",
                "text-4xl",
                timesBroken >= 2 && index < hideUnder && "hidden"
              )}
            />
          ))}
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
);

export function Cursor({
  container,
}: {
  container: RefObject<HTMLDivElement>;
}) {
  const [wordIndex] = useAtom(wordIndexAtom);
  const [val] = useAtom(inputAtom);
  const [pos, setpos] = useState([0, 0]);

  const secondLineY = useRef(0);

  const [timesBroken] = useAtom(lineBreakCountAtom);

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
        if (wordIndex === 0) {
          secondLineY.current = 0;
        }

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
      className="absolute h-8 w-2 caret"
      style={{ left: pos[0], top: pos[1], marginTop: 4 }}
      // style={{ transform: `translate(${pos[0]}px, ${pos[1]}px)`, marginTop: 4 }}
    />
  );
}
