import { useAtomValue } from "jotai";
import {
  gModeTypeAtom,
  gTimeAtom,
  GameMode,
  gStateAtom,
  GameState,
  gModeConditionAtom,
  gRoomStateAtom,
} from "../state";
import { useAPM } from "../hooks/use-apm";

function GameInfo() {
  const gCondition = useAtomValue(gModeConditionAtom);
  const gTime = useAtomValue(gTimeAtom);

  return (
    <div className="flex gap-4">
      <GameModeDebug />[{gCondition},{gTime || gCondition}]<span>-</span>
      <GameStateDebug />
      <span>-</span>
      <APMDebug />
      <RoomDebug />
    </div>
  );
}

function RoomDebug() {
  const gRoomState = useAtomValue(gRoomStateAtom);

  return <span>{JSON.stringify(gRoomState)}</span>;
}

function APMDebug() {
  const apm = useAPM();

  return <span>{apm}</span>;
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
    value = "Waiting for player";
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

export { GameInfo };
