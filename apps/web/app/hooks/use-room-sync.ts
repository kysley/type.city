import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  addStateToWord,
  cursorAtom,
  gRoomBusAtom,
  gRoomStateAtom,
  inputAtom,
  wordIndexAtom,
  wordsAtom,
} from "../state";
import { useEffect, useState } from "react";
import { useSocket } from "./use-socket";
import { useResetTypingState } from "./use-reset-local";
import { RoomState } from "types";

function useRoomSync(gameId: string) {
  const { socket } = useSocket();
  const { resetState } = useResetTypingState();

  const [countdown, setCountdown] = useState<undefined | number>(undefined);
  const [roomState, setRoomState] = useAtom(gRoomStateAtom);
  const setWords = useSetAtom(wordsAtom);
  const setBus = useSetAtom(gRoomBusAtom);
  const wordIndex = useAtomValue(wordIndexAtom);
  const input = useAtomValue(inputAtom);
  const cursorId = useAtomValue(cursorAtom);

  const canEmitClientUpdate = roomState?.state === RoomState.IN_PROGRESS;

  useEffect(() => {
    socket?.emit("client.room.join", gameId, { cursorId, userbarId: "0" });
    socket?.on("server.room.join", (data) => {
      console.info(`room ${gameId} joined`);
      resetState();
      setWords((data.words as string[]).map((w, i) => addStateToWord(w, i)));
      setRoomState(data);
    });

    socket?.on("room.countdown", (evtTime) => {
      if (evtTime === 0) {
        setCountdown(undefined);
      } else {
        setCountdown(evtTime);
      }
    });

    socket?.on("room.bus", (evt) => {
      console.log(evt);
      setBus((p) => [evt, ...p]);
    });
    socket?.on("room.update", (evt) => {
      console.log({ evt });
      setRoomState((p) => ({ ...p, ...evt }));
    });
  }, [socket]);

  useEffect(() => {
    if (canEmitClientUpdate) {
      socket?.emit("client.update", { wordIndex, letterIndex: input.length });
    }
  }, [wordIndex, input.length, canEmitClientUpdate]);

  useEffect(() => {
    if (roomState?.state === RoomState.GAME_OVER) {
      resetState();
    }
  }, [roomState?.state]);

  return {
    readyUp: () => socket.emit("client.room.ready"),
    countdown,
    myId: socket.id,
  };
}

export { useRoomSync };
