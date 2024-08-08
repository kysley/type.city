import { useAtomValue } from "jotai";
import { useSocket } from "../../hooks/use-socket";
import { gRoomStateAtom } from "../../state";
import { userbarLookup } from "../../utils/userbars";

function RoomPlayerList() {
  const gRoomState = useAtomValue(gRoomStateAtom);
  const { socket } = useSocket();

  // const players =
  // gRoomState.players?.filter((player) => player.id !== socket?.id) || [];
  // console.log(players);
  return (
    <div>
      <ul>
        {gRoomState?.players?.map((p) => (
          <li>
            {p.id}, {p.apm}
            <img src={userbarLookup[p?.userbarId || "0"]} alt="userbar" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export { RoomPlayerList };
