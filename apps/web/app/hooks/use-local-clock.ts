import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  GameMode,
  gModeTypeAtom,
  GameState,
  gTimeAtom,
  gStateAtom,
  snapshotAtom,
  gSnapshotAtom,
  gConditionAtom,
} from "../state";
import { useEffect } from "react";
import { useAtomCallback } from "jotai/utils";
import { detectCheating } from "../utils/anticheat";
import * as timers from "react-timer-hook";

const { useTimer: useTimerNew, useStopwatch } = timers;

let startTime: number | null;

function useLocalClock() {
  const gMode = useAtomValue(gModeTypeAtom);
  const gameCondition = useAtomValue(gConditionAtom);
  const [gameState, setGameState] = useAtom(gStateAtom);

  const takeSnapshot = useAtomCallback((get, set) => {
    const snap = get(snapshotAtom);
    set(gSnapshotAtom, snap);

    return snap;
  });

  const setTimeAtom = useSetAtom(gTimeAtom);

  // Used when GameMode.LIMIT
  const limitTimer = useTimerNew({
    autoStart: false,
    onExpire() {
      // takeSnapshot();
      setGameState(GameState.DONE);
    },
    expiryTimestamp: new Date(Date.now() + gameCondition * 1000),
  });

  // Used when GameMode.RACE
  const raceTimer = useStopwatch({
    autoStart: false,
  });

  // Reset timer when key game properties change
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (gMode === GameMode.LIMIT) {
      limitTimer.restart(new Date(Date.now() + gameCondition * 1000), false);
    } else {
      raceTimer.reset();
    }
  }, [gMode, gameCondition]);

  // Sync timer based on GameState changing
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (gMode === GameMode.LIMIT) {
      if (gameState === GameState.WAITING) {
        limitTimer.pause();
        limitTimer.restart(new Date(Date.now() + gameCondition * 1000), false);
      } else if (gameState === GameState.PLAYING) {
        startTime = Date.now();
        limitTimer.start();
      }
    } else if (gMode === GameMode.RACE) {
      if (gameState === GameState.WAITING) {
        raceTimer.pause();

        raceTimer.reset(undefined, false);
      } else if (gameState === GameState.PLAYING) {
        startTime = Date.now();
        raceTimer.start();
        // When the user finishes the words available
      } else if (gameState === GameState.DONE) {
        raceTimer.pause();
      }
    }
  }, [gameState]);

  // Sync clock time with game state
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;
    takeSnapshot();
    if (gMode === GameMode.LIMIT) {
      // takeSnapshot();

      // set time counting up from 0 always
      setTimeAtom(gameCondition - limitTimer.totalSeconds);
    } else {
      setTimeAtom(raceTimer.totalSeconds);
    }
  }, [limitTimer.totalSeconds, raceTimer.totalSeconds]);

  return {};
}

export { useLocalClock };
