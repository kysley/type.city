import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { apmAtom, gRoomStateAtom } from "../state";
import { useEffect } from "react";
import { useSocket } from "./use-socket";

function useGameSync(gameId: string) {
  const { socket } = useSocket();
  const apm = useAtomValue(apmAtom);
  const [roomState, setRoomState] = useAtom(gRoomStateAtom);

  useEffect(() => {
    if (gameId) {
      socket?.emit("client.room.join", gameId);
      socket?.on("server.room.join", (data) => {
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

  return {
    players: roomState?.players?.filter((player) => player.id !== socket?.id),
  };
}

export { useGameSync };
