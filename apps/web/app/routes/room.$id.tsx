import { MetaFunction, useParams } from "@remix-run/react";
import { useRoomSync } from "../hooks/use-room-sync";
import { useAtomValue } from "jotai";
import { gRoomStateAtom, wordsAtomAtom } from "../state";
import { WordSync } from "./_index";
import { WordComposition } from "../components/word-list";
import { Box, Flex } from "@wwwares/ui-system/jsx";
import { RoomBusDisplay } from "../components/rooms/room-bus";
import { RoomPlayerList } from "../components/rooms/player-list";
import { ClientOnly } from "remix-utils/client-only";
import { Button } from "@wwwares/ui-react";
import { RoomState } from "types";
import { useRoomClock } from "../hooks/use-room-clock";

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

  useRoomClock();

  const room = useAtomValue(gRoomStateAtom);
  const words = useAtomValue(wordsAtomAtom);

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
        {room?.state === RoomState.GAME_OVER && (
          <Flex
            flexDirection="column"
            alignItems="flex-start"
            gridColumn="3 / span 6"
            gridRowStart="5"
          >
            <span>GAME IS OVER.</span>
            {room?.players
              .sort((p1, p2) => p1?.wpm < p2.wpm)
              .map((player) => (
                <span key={player.id}>
                  {player.id} {player.wpm}
                </span>
              ))}
            <Button intent="primary" onPress={readyUp}>
              Play again
            </Button>
          </Flex>
        )}
        {(room?.state === RoomState.LOBBY ||
          room?.state === RoomState.STARTING ||
          room?.state === RoomState.IN_PROGRESS) && (
          <WordComposition
            words={words}
            canType={room.state === RoomState.IN_PROGRESS}
          />
        )}
        {room?.state === RoomState.LOBBY && (
          <Flex
            flexDirection="column"
            alignItems="flex-start"
            gridColumn="3 / span 6"
            gridRowStart="4"
          >
            <span>WAITING FOR ANOTHER PLAYER</span>
          </Flex>
        )}
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
      </Flex>
    </Flex>
  );
}
