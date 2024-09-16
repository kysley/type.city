import { MetaFunction, useParams } from "@remix-run/react";
import { useRoomSync } from "../hooks/use-room-sync";
import { useAtomValue } from "jotai";
import { gRoomStateAtom, wordsAtomAtom } from "../state";
import { WordSync } from "./_index";
import { WordComposition } from "../components/word-list";
import { Flex } from "@wwwares/ui-system/jsx";
import { RoomPlayerList } from "../components/rooms/player-list";
import { ClientOnly } from "remix-utils/client-only";
import { Button } from "@wwwares/ui-react";
import { gameModeName, Room, RoomState } from "types";
import { IconAward, IconInfoCircle, IconUsersGroup } from "@tabler/icons-react";
import { useSocket } from "../hooks/use-socket";
import { StatShield } from "../components/stat-shield";
import { Userbar } from "../components/userbar";
import { Positions } from "../components/layout-positions";
import { addOrdinalSuffix } from "../utils/ordinal";
import { Fragment } from "react/jsx-runtime";
import { useRoomClock } from "../hooks/use-room-clock";
import { LocalGameDisplay } from "../components/local/game-display";

export const meta: MetaFunction = () => {
  return [
    { title: "typing2024 - room" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function RoomId() {
  return <ClientOnly>{() => <WrappedRoom />}</ClientOnly>;
}

function RoomWaitingScreen({ room }: { room: Room }) {
  const { socket } = useSocket();

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
          <IconUsersGroup style={{ display: "inline" }} />
          {` ${room?.players.length}/6`}
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
          <StatShield title="Mode" value={gameModeName[room.mode]} />
          <StatShield title="Condition" value={room.condition} />
        </Flex>
        <Flex as="ul" flexBasis="50%" flexDirection="column" gap="3">
          {room?.players?.map((p) => (
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

  useRoomClock();

  const room = useAtomValue(gRoomStateAtom);
  const words = useAtomValue(wordsAtomAtom);

  return (
    <Fragment>
      <Positions.Center>
        {room?.state === RoomState.LOBBY && <RoomWaitingScreen room={room} />}
        {room?.state === RoomState.GAME_OVER && (
          <RoomEndScreen room={room} onReady={readyUp} id={myId} />
        )}
        {(room?.state === RoomState.STARTING ||
          room?.state === RoomState.IN_PROGRESS) && (
          <WordComposition
            words={words}
            canType={room.state === RoomState.IN_PROGRESS}
          />
        )}
      </Positions.Center>

      <Positions.CenterAbove>
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
        {/* Using this seems to be fine since we sync with internal state. Can rename component */}
        {room?.state === RoomState.IN_PROGRESS && <LocalGameDisplay />}
      </Positions.CenterAbove>
      {/* <Box
          gridColumn={"9 / span 10"}
          gridRow={"5/5"}
          overflowY={"scroll"}
          height="100%"
        >
          <RoomBusDisplay />
        </Box> */}
      {/* </CoreGrid> */}

      <WordSync />
    </Fragment>
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
          Game over! <IconAward style={{ display: "inline" }} /> You came{" "}
          {addOrdinalSuffix(yourPosition)}
        </span>
      </Flex>
      <RoomPlayerList />
      <Flex justifyContent="flex-end" gap="5">
        <Button intent="neutral" onPress={onReady}>
          Rematch ({`${playersReady}/${room?.players.length}`})
        </Button>
        <Button intent="primary">New game</Button>
      </Flex>
    </Flex>
  );
}
