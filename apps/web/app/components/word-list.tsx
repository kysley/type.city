import { PrimitiveAtom, useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  WordState,
  cursorAtom,
  focusAtom,
  hideWordsOverIndexAtom,
  hideWordsUnderIndexAtom,
  inputAtom,
  lineBreakCountAtom,
  lineBreakIndicesAtom,
  refocusAtom,
  wordIndexAtom,
} from "../state";
import {
  Fragment,
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
import { Box, Flex } from "@wwwares/ui-system/jsx";
import { RoomCursors } from "./rooms/room-cursors";
import { useDelayedBlur } from "../hooks/use-delayed-blur";
import { IconAlertTriangle } from "@tabler/icons-react";

export function WordComposition({
  words,
  canType = true,
}: WordListProps & { canType?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const triggerFocus = useSetAtom(refocusAtom);
  const [hasFocus, setHasFocus] = useAtom(focusAtom);

  const [height, setHeight] = useState(0);
  const [showHelp, setShowHelp] = useState(!hasFocus);

  useDelayedBlur(hasFocus, 400, () => setShowHelp(true));

  useLayoutEffect(() => {
    if (containerRef.current) {
      const $height = containerRef.current.children.item(0)?.clientHeight;
      if (!$height) {
        setHeight(0);
        return;
      }
      setHeight($height * 4.5);
    }
  }, []);

  return (
    <Fragment>
      <Box
        gridColumn="3 / span 6"
        gridRowStart="5"
        border={
          showHelp || !canType
            ? "1px solid {colors.zinc.200}"
            : "1px solid transparent"
        }
        userSelect={"none"}
      >
        <Box
          // tabIndex={-1}
          style={{
            position: "relative",
            zIndex: 1,
            opacity: showHelp || !canType ? 0.15 : 1,
            // filter: showHelp ? "blur(4px)" : undefined,
            // ...(showHelp ? { filter: "blur(3px)" } : undefined),
            // ...(showHelp ? { opacity: "0.5" } : undefined),
            transition: "opacity 150ms ease-in",
            cursor: "text",
          }}
          onFocus={() => {
            if (!hasFocus) {
              triggerFocus((p) => p + 1);
              setShowHelp(false);
            }
          }}
          onBlur={() => setHasFocus(false)}
          onClick={() => {
            if (!hasFocus) {
              triggerFocus((p) => p + 1);
              setShowHelp(false);
            }
          }}
        >
          {/* for some reason facade input NEEDS to be PRECISELY here... */}
          <FacadeInput canType={canType} />
          <WordList ref={containerRef} words={words} height={height} />
          {height && <RoomCursors container={containerRef} />}
          {height && <Cursor container={containerRef} />}
        </Box>
      </Box>
      <Box gridColumn="4 / span 5" gridRowStart="6" alignSelf="flex-start">
        {showHelp && (
          <Flex
            backgroundColor="amber.900"
            color="amber.200"
            borderRadius="0px 0px 4px 4px"
            border="1px solid {colors.amber.300}"
            borderTop="none"
            paddingX="5"
            flex={1}
          >
            <IconAlertTriangle scale={1} />
            Click on the words to type.
          </Flex>
        )}
        {!canType && (
          <Flex
            backgroundColor="red.900"
            color="red.200"
            borderRadius="0px 0px 4px 4px"
            border="1px solid {colors.red.300}"
            borderTop="none"
            paddingX="5"
            flex={1}
          >
            <IconAlertTriangle scale={1} />
            You cannot type yet.
          </Flex>
        )}
      </Box>
    </Fragment>
  );
}

type WordListProps = {
  words: PrimitiveAtom<WordState>[];
  height?: number;
};
export const WordList = forwardRef<HTMLDivElement, WordListProps>(
  function WordList({ words, height }, container) {
    const [breaks, setBreaks] = useAtom(lineBreakIndicesAtom);
    const [timesBroken, setTimesBroken] = useAtom(lineBreakCountAtom);
    const [{ wordLimit }, setHideOver] = useAtom(hideWordsOverIndexAtom);
    const [hideUnder, setHideUnder] = useAtom(hideWordsUnderIndexAtom);

    const [wordIndex] = useAtom(wordIndexAtom);

    useLayoutEffect(() => {
      if (container?.current) {
        const words = Array.from(
          container?.current.children
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
              setHideOver((p) => ({ ...p, cursorLimit: i - 1 }));
            }
            if (_breaks.length === 4) {
              // set an arbitrary number of additional words to render to help with line breaks
              // When this was just `i`, word scrolling bugs out after a while
              setHideOver((p) => ({ ...p, wordLimit: i + 5 }));
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
      <Flex
        gap="1.25rem"
        width="100%"
        height="100%"
        flexWrap="wrap"
        style={{ height, overflow: "hidden" }}
        ref={container}
      >
        {words.map((word, index) => (
          <Word
            key={word.toString()}
            wordAtom={word}
            className={clsx(
              "word",
              "text-4xl",
              timesBroken >= 2 && index < hideUnder && "hidden",
              index > wordLimit && wordLimit > 0 && "hidden"
            )}
          />
        ))}
      </Flex>
    );
  }
);

export function Cursor({
  container,
  cursorId,
}: {
  container: RefObject<HTMLDivElement>;
  cursorId?: string;
}) {
  const [wordIndex] = useAtom(wordIndexAtom);
  const [val] = useAtom(inputAtom);
  const [pos, setpos] = useState([0, 0]);
  const storedCursorId = useAtomValue(cursorAtom);
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
        // const { left, right, y } = letter.getBoundingClientRect();
        if (wordIndex === 0) {
          secondLineY.current = 0;
        }

        // const vec1 = !isLastLetter ? left : right;
        const vec1 = !isLastLetter
          ? letter.offsetLeft
          : letter.offsetLeft + letter.offsetWidth;
        // const vec2 = secondLineY.current || y;
        const vec2 = secondLineY.current || letter.offsetTop;

        // Keep the y value for the second line
        if (timesBroken === 1 && secondLineY.current === 0) {
          // secondLineY.current = y;
          secondLineY.current = letter.offsetTop;
        }

        setpos([vec1, vec2]);
      }
    }
  }, [val, wordIndex]);

  return (
    <Box
      position="absolute"
      height="8"
      width="2"
      className={`caret caret${cursorId ?? storedCursorId}`}
      style={{
        left: pos[0],
        top: pos[1],
        marginTop: 4,
        // backgroundImage: `url('${cursorUrl}')`,
      }}
    />
  );
}
