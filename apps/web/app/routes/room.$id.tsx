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
import { Fragment } from "react/jsx-runtime";
import { IconAlertTriangle, IconUsersGroup } from "@tabler/icons-react";

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
  const { readyUp, countdown } = useRoomSync(id || "localdev");

  useRoomClock();

  const room = useAtomValue(gRoomStateAtom);
  const words = useAtomValue(wordsAtomAtom);

  const playersReady = room?.players.filter((p) => p.isReady).length;

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
              Play again ({playersReady})
            </Button>
          </Flex>
        )}
        {(room?.state === RoomState.LOBBY ||
          room?.state === RoomState.STARTING ||
          room?.state === RoomState.IN_PROGRESS) && (
          <Fragment>
            <WordComposition
              words={words}
              canType={room.state === RoomState.IN_PROGRESS}
            />
            {room.state === RoomState.LOBBY && (
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
                Waiting for race to start.
              </Flex>
            )}
          </Fragment>
        )}

        <Flex
          flexDirection="column"
          alignItems="flex-start"
          gridColumn="3 / span 6"
          gridRowStart="4"
        >
          {room?.state === RoomState.LOBBY && (
            <p>
              <IconUsersGroup />
              <span>{room?.players.length}</span>
            </p>
          )}
          {room?.state === RoomState.STARTING && <span>{countdown}</span>}
        </Flex>
        <Box
          gridColumn={"9 / span 10"}
          gridRow={"5/5"}
          overflowY={"scroll"}
          height="100%"
        >
          <RoomBusDisplay />
        </Box>
        <Box gridRow={"7 / -1"} gridColumn={"3 / span 6"} height="100%">
          <RoomPlayerList />
        </Box>
      </Flex>

      <WordSync />
    </Flex>
  );
}
