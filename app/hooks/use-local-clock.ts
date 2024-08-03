import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useTimer } from "use-timer";
import {
  GameMode,
  gModeConditionAtom,
  gModeTypeAtom,
  GameState,
  gTimeAtom,
  gStateAtom,
} from "../state";
import { useEffect } from "react";

function useLocalClock() {
  const gMode = useAtomValue(gModeTypeAtom);
  const gameCondition = useAtomValue(gModeConditionAtom);
  const gameState = useAtomValue(gStateAtom);

  const setTimeAtom = useSetAtom(gTimeAtom);
  const setGameState = useSetAtom(gStateAtom);

  useEffect(() => {
    if (gameState === GameState.WAITING) {
      timer.pause();
      timer.reset();
    }
  }, [gameState]);

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
    },
  });

  return { timer };
}

export { useLocalClock };
