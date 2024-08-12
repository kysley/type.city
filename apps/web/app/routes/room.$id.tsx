import { MetaFunction, useParams } from "@remix-run/react";
import { useRoomSync } from "../hooks/use-room-sync";
import { useAtomValue } from "jotai";
import { gRoomStateAtom, wordsAtom, wordsAtomAtom } from "../state";
import { WordSync } from "./_index";
import { WordComposition } from "../components/word-list";
import { GameDebug } from "../components/game-info";
import { Box, Flex } from "@wwwares/ui-system/jsx";
import { RoomBusDisplay } from "../components/rooms/room-bus";
import { RoomPlayerList } from "../components/rooms/player-list";
import { ClientOnly } from "remix-utils/client-only";
import { Button } from "@wwwares/ui-react";
import { useResetTypingState } from "../hooks/use-reset-local";
import { useEffect } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "typing2024 - room" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function RoomId() {
  return <ClientOnly>{() => <WrappedRoom />}</ClientOnly>;
}

function WrappedRoom() {
  const { id } = useParams();
  const { readyUp } = useRoomSync(id || "localdev");
  const { resetState } = useResetTypingState({
    includeState: false,
    includeTime: true,
    includeWords: true,
    resetWords: true,
  });

  const { gameId, state } = useAtomValue(gRoomStateAtom);
  const words = useAtomValue(wordsAtomAtom);

  useEffect(() => {
    if (state === 0 || state === 3) {
      resetState();
    }
  }, [state]);

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
      >
        {gameId}
        {state === 3 && (
          <Flex
            flexDirection="column"
            alignItems="flex-start"
            gridColumn="3 / span 6"
            gridRowStart="5"
          >
            <span>GAME IS OVER.</span>
            <Button intent="primary" onPress={readyUp}>
              Play again
            </Button>
          </Flex>
        )}
        {(state === 0 || state === 1 || state === 2) && (
          <Box gridColumn="3 / span 6" gridRowStart="5">
            <WordComposition words={words} />
          </Box>
        )}
        {state === 0 && <span>WAITING FOR ANOTHER PLAYER</span>}
        <WordSync />
        <Box
          gridColumn={"3"}
          gridRowStart={"6"}
          overflow={"scroll"}
          height={150}
        >
          <RoomBusDisplay />
        </Box>
        <Box gridRowStart={"6"} gridColumn={"3 / span 6"}>
          <RoomPlayerList />
        </Box>
        <GameDebug />
      </Flex>
    </Flex>
  );
}
