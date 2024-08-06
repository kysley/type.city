import { useAtomValue } from "jotai";
import { useSocket } from "../../hooks/use-socket";
import { gRoomStateAtom } from "../../state";

function RoomPlayerList() {
  const gRoomState = useAtomValue(gRoomStateAtom);
  const { socket } = useSocket();

  const players =
    gRoomState.players?.filter((player) => player.id !== socket?.id) || [];

  return (
    <div>
      <ul>
        {players.map((p) => (
          <li>
            {p.id}, {p.apm}
          </li>
        ))}
      </ul>
    </div>
  );
}

export { RoomPlayerList };
