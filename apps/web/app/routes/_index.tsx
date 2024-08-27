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
import { GameDebug } from "../components/game-info";
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
        <GameDebug />

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
                <LocalGameActions />
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
  const setGState = useSetAtom(gStateAtom);
  const gCondition = useAtomValue(gConditionAtom);
  const wordIndex = useAtomValue(wordIndexAtom);

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

  return null;
}

export function WordSync() {
  useSyncInput();

  return null;
}
