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
import { Room, RoomState } from "types";
import { useRoomClock } from "../hooks/use-room-clock";
import { Fragment } from "react/jsx-runtime";
import {
  IconAlertTriangle,
  IconAward,
  IconInfoCircle,
  IconNumber1,
  IconNumber2,
  IconNumber3,
  IconUser,
  IconUsersGroup,
} from "@tabler/icons-react";
import { ReactElement } from "react";
import { useSocket } from "../hooks/use-socket";
import { userbarLookup } from "../utils/userbars";
import { StatShield } from "../components/stat-shield";
import { Userbar } from "../components/userbar";

export const meta: MetaFunction = () => {
  return [
    { title: "typing2024 - room" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function RoomId() {
  return <ClientOnly>{() => <WrappedRoom />}</ClientOnly>;
}

function RoomWaitingScreen() {
  const gRoom = useAtomValue(gRoomStateAtom);

  const { socket } = useSocket();

  // const players =
  // gRoomState.players?.filter((player) => player.id !== socket?.id) || [];
  // console.log(players);
  return (
    // <div>
    <Flex
      backgroundColor="zinc.800"
      p={2}
      borderRadius="sm"
      gap="5"
      flexDirection="column"
      color="zinc.200"
    >
      <Flex
        color="zinc.200"
        justifyContent="space-between"
        backgroundColor="zinc.600"
        m={-2}
        p={2}
        borderRadius="{radii.sm} {radii.sm} 0 0"
      >
        <span>
          <IconUsersGroup style={{ display: "inline" }} />
          {` ${gRoom?.players.length}/6`}
        </span>
        Waiting for more players.
      </Flex>
      <Flex>
        <Flex
          flexBasis="50%"
          flexDirection="column"
          alignItems="flex-start"
          gap="3"
        >
          <StatShield title="Mode" value="Time" />
          <StatShield title="Duration" value="30" />
        </Flex>
        <Flex as="ul" flexBasis="50%" flexDirection="column" gap="3">
          {gRoom?.players?.map((p) => (
            <li>
              {p.id}
              {p.id === socket.id ? "(you)" : null}
              <Userbar id={p?.userbarId || "0"} />
            </li>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
}

function WrappedRoom() {
  const { id } = useParams();
  const { readyUp, countdown, myId } = useRoomSync(id || "localdev");

  // useRoomClock();

  const room = useAtomValue(gRoomStateAtom);
  const words = useAtomValue(wordsAtomAtom);

  // return <RoomGameEnd room={room} onReady={readyUp} id={myId} />;

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
        {/* {room?.state === RoomState.LOBBY && (
          // <Box gridRow={"3 / span 6"} gridColumn={"3 / span 6"} height="100%">
          <Box gridColumn="3 / span 6" gridRowStart="5">
            <RoomWaitingScreen />
          </Box>
        )} */}
        {3 === RoomState.GAME_OVER && (
          <Box gridColumn="3 / span 6" gridRowStart="5">
            <RoomEndScreen room={room} onReady={readyUp} id={myId} />
          </Box>
        )}
        {(room?.state === RoomState.STARTING ||
          room?.state === RoomState.IN_PROGRESS) && (
          <WordComposition
            words={words}
            canType={room.state === RoomState.IN_PROGRESS}
          />
        )}

        <Flex
          flexDirection="row"
          // alignItems="flex-end"
          alignSelf="flex-end"
          gridColumn="3 / span 6"
          gridRowStart="4"
          color="white"
          gap="5"
        >
          {room?.state === RoomState.STARTING && (
            <Flex
              backgroundColor="blue.900"
              color="white"
              // borderRadius="0px 0px 4px 4px"
              border="1px solid {colors.blue.300}"
              borderTop="none"
              paddingX="5"
              flex={1}
            >
              <IconInfoCircle scale={1} />
              Starting in... {countdown}
            </Flex>
          )}
        </Flex>
        {/* <Box
          gridColumn={"9 / span 10"}
          gridRow={"5/5"}
          overflowY={"scroll"}
          height="100%"
        >
          <RoomBusDisplay />
        </Box> */}
      </Flex>

      <WordSync />
    </Flex>
  );
}

function RoomEndScreen({
  room,
  onReady,
  id,
}: {
  room: Room;
  onReady(): void;
  id: string;
}) {
  const playersReady = room?.players.filter((p) => p.isReady).length;

  const rankedPlayers = room?.players.sort((p1, p2) => p1?.wpm < p2.wpm);

  const yourPosition =
    rankedPlayers?.findIndex((player) => player.id === id) + 1;

  return (
    <Flex
      backgroundColor="zinc.800"
      p={2}
      borderRadius="sm"
      gap="5"
      flexDirection="column"
      color="zinc.200"
    >
      <Flex
        color="zinc.200"
        justifyContent="space-between"
        backgroundColor="zinc.600"
        m={-2}
        p={2}
        borderRadius="{radii.sm} {radii.sm} 0 0"
      >
        <span>
          Game over! <IconAward style={{ display: "inline" }} /> You placed{" "}
          {yourPosition}
        </span>
      </Flex>
      <RoomPlayerList />
      <Button intent="primary" onPress={onReady}>
        Play again ({playersReady})
      </Button>
    </Flex>
  );
}
