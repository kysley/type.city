import { useAtomValue } from "jotai";
import { gRoomUsers } from "../state";
import { useSocket } from "./use-socket";

function useRoomPlayers({ includeSelf = false } = {}) {
  const players = useAtomValue(gRoomUsers);
  const { socket } = useSocket();

  return {
    players: includeSelf
      ? players
      : players.filter((player) => player.id !== socket?.id),
  };
}

export { useRoomPlayers };
