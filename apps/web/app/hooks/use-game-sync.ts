import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  addStateToWord,
  apmAtom,
  gRoomStateAtom,
  inputAtom,
  wordIndexAtom,
  wordsAtom,
} from "../state";
import { useEffect } from "react";
import { useSocket } from "./use-socket";

function useGameSync(gameId: string) {
  const { socket } = useSocket();
  const apm = useAtomValue(apmAtom);
  const setRoomState = useSetAtom(gRoomStateAtom);
  const setWords = useSetAtom(wordsAtom);
  const wordIndex = useAtomValue(wordIndexAtom);
  const input = useAtomValue(inputAtom);

  useEffect(() => {
    if (gameId) {
      socket?.emit("client.room.join", gameId);
      socket?.on("server.room.join", (data) => {
        setWords(data.words.map((w, i) => addStateToWord(w, i)));
        setRoomState(data);
      });
      socket?.on("room.bus", (evt) => console.log(evt));
      socket?.on("room.update", (evt) => {
        console.log({ evt });
        setRoomState(evt);
      });
    }
  }, [gameId]);

  useEffect(() => {
    socket?.emit("client.update", { apm: apm || 0 });
  }, [apm]);

  useEffect(() => {
    socket?.emit("client.update", { wordIndex, letterIndex: input.length });
  }, [wordIndex, input.length]);

  return null;
}

export { useGameSync };
