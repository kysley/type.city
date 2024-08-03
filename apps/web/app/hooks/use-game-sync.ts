import { useAtomValue, useSetAtom } from "jotai";
import { apmAtom, gRoomStateAtom } from "../state";
import { useEffect } from "react";
import { useSocket } from "./use-socket";

function useGameSync(gameId: string) {
  const { socket } = useSocket();
  const apm = useAtomValue(apmAtom);
  const setRoomState = useSetAtom(gRoomStateAtom);

  useEffect(() => {
    if (gameId) {
      socket?.emit("client.room.join", gameId);
      socket?.on("server.room.join", (data) => {
        setRoomState(data);
      });
      socket?.on("room.bus", (evt) => console.log(evt));
      socket?.on("room.update", (evt) => setRoomState(evt));
    }
  }, [gameId]);

  useEffect(() => {
    socket?.emit("client.apm", apm);
  }, [apm]);
}

export { useGameSync };
