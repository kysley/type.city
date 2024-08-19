import { useAtom, useAtomValue, useSetAtom } from "jotai";
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
  const [gameState, setGameState] = useAtom(gStateAtom);
  const snapshot = useAtomCallback((get) => {
    return get(snapshotAtom);
  });
  const setGSnapshot = useSetAtom(gSnapshotAtom);

  const setTimeAtom = useSetAtom(gTimeAtom);

  // biome-ignore lint/correctness/useExhaustiveDependencies: need to do this when either things change
  useEffect(() => {
    timer.reset();
  }, [gMode, gameCondition]);

  useEffect(() => {
    if (gameState === GameState.WAITING) {
      timer.pause();
      timer.reset();
    } else if (gameState === GameState.PLAYING) {
      timer.start();
      // This would happen if GameMode.RACE
    } else if (gameState === GameState.DONE) {
      timer.pause();
    }
  }, [gameState]);

  const timer = useTimer({
    autostart: false,
    // count down if LIMIT, count up if RACE
    endTime: gMode === GameMode.LIMIT ? 0 : undefined,
    initialTime: gMode === GameMode.LIMIT ? gameCondition : 0,
    timerType: gMode === GameMode.LIMIT ? "DECREMENTAL" : "INCREMENTAL",
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
