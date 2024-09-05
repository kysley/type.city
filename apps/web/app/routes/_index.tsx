import type { MetaFunction } from "@remix-run/node";
import {
  GameMode,
  GameState,
  gConditionAtom,
  gModeTypeAtom,
  gSnapshotAtom,
  gStateAtom,
  snapshotAtom,
  wordIndexAtom,
  wordsAtomAtom,
} from "../state";
import { WordComposition } from "../components/word-list";
import { Fragment, useEffect } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useSyncInput } from "../hooks/use-sync-input";
import { LocalGameEndScreen } from "../components/local-game-end-screen";
import { Box, Flex } from "@wwwares/ui-system/jsx";
import {
  LocalGameActions,
  LocalGameRestart,
} from "../components/local/game-actions";
import { useNavigate } from "@remix-run/react";
import { useSocket } from "../hooks/use-socket";
import { useLocalClock } from "../hooks/use-local-clock";
import { useResetTypingState } from "../hooks/use-reset-local";
import { useAtomCallback } from "jotai/utils";
import { useMutation } from "@tanstack/react-query";
import { LocalGameDisplay } from "../components/local/game-display";
import { ResultResponse, ResultSubmission, WordState } from "types";

export const meta: MetaFunction = () => {
  return [
    { title: "type.city ⌨️" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

// export const loader = async () => {
//   const words = getWords(1000);
//   return json({ words });
// };

function useRoomRedirect() {
  const { socket } = useSocket();
  const navigate = useNavigate();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    socket.on("server.room.created", (data) => {
      navigate(`/room/${data}`);
    });
  }, []);

  return null;
}

// fetch("http://localhost:8013/temp", { method: "GET", credentials: "include" });
export default function Index() {
  const [words] = useAtom(wordsAtomAtom);
  const gState = useAtomValue(gStateAtom);

  useRoomRedirect();

  return (
    <Flex
      height="100%"
      width="100%"
      justifyContent="center"
      alignItems="center"
    >
      <Flex
        justifyContent="center"
        alignItems="center"
        width="100%"
        height="100%"
        overflow="hidden"
        flexDirection="column"
        display="grid"
        gridTemplateColumns="repeat(10, 1fr)"
        gridTemplateRows="repeat(10, 1fr)"
        data-color-mode="dark"
      >
        <WordSync />
        <SingleplayerController />

        {gState === GameState.DONE ? (
          <Box gridColumn="3 / span 6" gridRowStart="5">
            <LocalGameEndScreen />
          </Box>
        ) : (
          <Fragment>
            {words.length > 0 ? (
              <Fragment>
                <WordComposition words={words} />
                <LocalGameRestart />
                {gState !== GameState.PLAYING ? (
                  <LocalGameActions />
                ) : (
                  <LocalGameDisplay />
                )}
              </Fragment>
            ) : null}
          </Fragment>
        )}
      </Flex>
    </Flex>
  );
}

// Stuffing a lot of logic into here really reduces page-level rerenders
function SingleplayerController() {
  useLocalClock();

  const gMode = useAtomValue(gModeTypeAtom);
  const [gState, setGState] = useAtom(gStateAtom);
  const gCondition = useAtomValue(gConditionAtom);
  const wordIndex = useAtomValue(wordIndexAtom);
  const gSnapshot = useAtomValue(gSnapshotAtom);

  const { mutate } = useMutation({
    mutationFn: async (result: ResultSubmission) => {
      const res = await fetch(`${import.meta.env.VITE_SERVICE_URL}/submit`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result),
      });

      const json = (await res.json()) as ResultResponse;

      return json;
    },
  });

  const { resetState } = useResetTypingState();

  const snapshot = useAtomCallback((get, set) => {
    const snap = get(snapshotAtom);
    set(gSnapshotAtom, snap);
  });

  // If the user changes the number of words to race/sprint we need to reset state
  // biome-ignore lint/correctness/useExhaustiveDependencies: resetState doesn't need to be included
  useEffect(() => {
    resetState();
  }, [gCondition, gMode]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (wordIndex === gCondition && gMode === GameMode.RACE) {
      snapshot();
      setGState(GameState.DONE);
      console.log("game condition has been reaache?D");
    }
  }, [wordIndex, gMode, gCondition, setGState]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (gState === GameState.DONE) {
      const { acc, apm, corrections, wordIndex, words, wpm } = gSnapshot as {
        wpm: number;
        acc: number;
        apm: number;
        wordIndex: number;
        words: WordState[];
        corrections: number;
      };
      mutate({
        accuracy: acc,
        startTime: Date.now(),
        condition: gCondition,
        mode: gMode,
        state: words,
        wordIndex,
        wpm,
      });
    }
  }, [gState]);

  return null;
}

export function WordSync() {
  useSyncInput();

  return null;
}
