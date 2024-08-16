import { useAtomValue, useSetAtom } from "jotai";
import { useTimer } from "use-timer";
import {
  GameMode,
  gModeConditionAtom,
  gModeTypeAtom,
  GameState,
  gTimeAtom,
  gStateAtom,
  snapshotAtom,
  gSnapshotAtom,
} from "../state";
import { useEffect } from "react";
import { useAtomCallback } from "jotai/utils";

function useLocalClock() {
  const gMode = useAtomValue(gModeTypeAtom);
  const gameCondition = useAtomValue(gModeConditionAtom);
  const gameState = useAtomValue(gStateAtom);
  const snapshot = useAtomCallback((get) => {
    return get(snapshotAtom);
  });
  const setGSnapshot = useSetAtom(gSnapshotAtom);

  const setTimeAtom = useSetAtom(gTimeAtom);
  const setGameState = useSetAtom(gStateAtom);

  useEffect(() => {
    if (gameState === GameState.WAITING) {
      timer.pause();
      timer.reset();
    } else if (gameState === GameState.PLAYING) {
      timer.start();
    }
  }, [gameState]);

  const timer = useTimer({
    autostart: false,
    initialTime: gameCondition,
    endTime: 0,
    timerType: gMode === GameMode.LIMIT ? "DECREMENTAL" : undefined,
    onTimeUpdate(time) {
      setTimeAtom(time);
      setGSnapshot(snapshot());
    },
    onTimeOver() {
      setGameState(GameState.DONE);
      setGSnapshot(snapshot());
    },
  });

  return { timer };
}

export { useLocalClock };
