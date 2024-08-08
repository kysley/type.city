import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  addStateToWord,
  apmAtom,
  cursorAtom,
  gRoomBusAtom,
  gRoomStateAtom,
  inputAtom,
  wordIndexAtom,
  wordsAtom,
} from "../state";
import { useEffect } from "react";
import { sockeet, useSocket } from "./use-socket";

function useRoomSync(gameId: string) {
  const { socket } = useSocket();

  const apm = useAtomValue(apmAtom);
  const setRoomState = useSetAtom(gRoomStateAtom);
  const setWords = useSetAtom(wordsAtom);
  const setBus = useSetAtom(gRoomBusAtom);
  const wordIndex = useAtomValue(wordIndexAtom);
  const input = useAtomValue(inputAtom);
  const cursorId = useAtomValue(cursorAtom);

  console.log(cursorId);

  useEffect(() => {
    if (socket?.connected) {
      socket?.emit("client.room.join", gameId, { cursorId, userbarId: "0" });
      socket?.on("server.room.join", (data) => {
        console.info(`room ${gameId} joined`);
        setWords(data.words.map((w, i) => addStateToWord(w, i)));
        setRoomState(data);
      });
      socket?.on("room.bus", (evt) => {
        console.log(evt);
        setBus((p) => [...p, evt]);
      });
      socket?.on("room.update", (evt) => {
        console.log({ evt });
        setRoomState((p) => ({ ...p, ...evt }));
      });
    }
  }, [socket]);

  useEffect(() => {
    socket?.emit("client.update", { apm: apm || 0 });
  }, [apm]);

  useEffect(() => {
    socket?.emit("client.update", { wordIndex, letterIndex: input.length });
  }, [wordIndex, input.length]);

  return null;
}

export { useRoomSync };
