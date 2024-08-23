import { useAtomValue } from "jotai";
import {
  gModeTypeAtom,
  gTimeAtom,
  GameMode,
  gStateAtom,
  GameState,
  gRoomStateAtom,
  gConditionAtom,
} from "../state";
import { useAPM } from "../hooks/use-apm";
import { useSocket } from "../hooks/use-socket";
import { Flex } from "@wwwares/ui-system/jsx";

function GameDebug() {
  const gCondition = useAtomValue(gConditionAtom);
  const gTime = useAtomValue(gTimeAtom);

  return (
    <Flex
      position="absolute"
      background="black"
      color="green"
      border="1px gray ridge"
      borderRadius="3px"
      boxShadow="lg"
      top="2"
      right="2"
      gap="2"
    >
      <GameModeDebug />[{gCondition},{gTime || gCondition}]<span>-</span>
      <APMDebug />
      <span>-</span>
      <GameStateDebug />
      <span>-</span>
      <RoomDebug />
    </Flex>
  );
}

function RoomDebug() {
  const gRoomState = useAtomValue(gRoomStateAtom);
  const socket = useSocket();

  if (!gRoomState) {
    return "not in room";
  }

  const players =
    gRoomState.players?.filter((player) => player.id !== socket.socket?.id) ||
    [];

  return <span>{gRoomState.players.length} players in room</span>;
}

function APMDebug() {
  const apm = useAPM();

  return <span>myapm:{apm}</span>;
}

function GameStateDebug() {
  const gState = useAtomValue(gStateAtom);

  let value = "";

  if (gState === GameState.DONE) {
    value = "Game over";
  }

  if (gState === GameState.PLAYING) {
    value = "Playing...";
  }

  if (gState === GameState.WAITING) {
    value = "Able to start...";
  }

  return <span>{value}</span>;
}

function GameModeDebug() {
  const gMode = useAtomValue(gModeTypeAtom);

  let value = "";

  if (gMode === GameMode.LIMIT) {
    value = "Limit";
  } else {
    value = "Race";
  }

  return <span>{value}</span>;
}

export { GameDebug };
