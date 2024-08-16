import { useAtomValue, useSetAtom } from "jotai";
import { useTimer } from "use-timer";
import { gTimeAtom, gRoomStateAtom, snapshotAtom } from "../state";
import { useEffect } from "react";
import { RoomState } from "types";
import { useResetTypingState } from "./use-reset-local";
import { useAtomCallback } from "jotai/utils";
import { useSocket } from "./use-socket";
import { calculateWPM } from "../utils/wpm";

function useRoomClock() {
  const setTimeAtom = useSetAtom(gTimeAtom);
  const room = useAtomValue(gRoomStateAtom);
  const { socket } = useSocket();

  const snapshot = useAtomCallback((get) => {
    return get(snapshotAtom);
  });

  useEffect(() => {
    if (
      room?.state === RoomState.LOBBY ||
      room?.state === RoomState.GAME_OVER
    ) {
      timer.pause();
      timer.reset();
    } else if (room?.state === RoomState.IN_PROGRESS) {
      timer.start();
    }
  }, [room?.state]);

  const timer = useTimer({
    autostart: false,
    initialTime: 30,
    endTime: 0,
    timerType: "DECREMENTAL",
    onTimeUpdate(time) {
      setTimeAtom(time);
      const snap = snapshot();
      const wpm = calculateWPM({
        index: snap.wordIndex,
        mistakes: snap.corrections,
        time: 30 - time,
        wordsState: snap.words,
      });

      socket?.emit("client.update", { apm: snap.apm, wpm: wpm.wpm });
    },
  });

  return { timer };
}

export { useRoomClock };
