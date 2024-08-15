import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useTimer } from "use-timer";
import {
  GameMode,
  gModeConditionAtom,
  gModeTypeAtom,
  gTimeAtom,
  gStateAtom,
  snapshotAtom,
  gSnapshotAtom,
  gRoomStateAtom,
} from "../state";
import { useEffect, useState } from "react";
import { useAtomCallback } from "jotai/utils";
import { RoomState } from "types";

function useRoomClock() {
  const room = useAtomValue(gRoomStateAtom);

  const snapshot = useAtomCallback((get) => {
    return get(snapshotAtom);
  });

  const setGSnapshot = useSetAtom(gSnapshotAtom);

  useEffect(() => {
    if (room?.state === RoomState.LOBBY) {
      timer.pause();
      timer.reset();
    }
  }, [room?.state]);

  const timer = useTimer({
    autostart: false,
    initialTime: gameCondition,
    endTime: 0,
    timerType: gMode === GameMode.LIMIT ? "DECREMENTAL" : undefined,
    onTimeUpdate(time) {
      setTimeAtom(time);
    },
    onTimeOver() {
      setGameState(GameState.DONE);
      console.log(snapshot());
      setGSnapshot(snapshot());
    },
  });

  return { timer };
}

export { useRoomClock };
