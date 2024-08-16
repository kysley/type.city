import { useAtomValue } from "jotai";
import { gRoomBusAtom } from "../../state";
import { Flex } from "@wwwares/ui-system/jsx";

function RoomBusDisplay() {
  const bus = useAtomValue(gRoomBusAtom);

  return (
    <Flex background="tan" color="yellow" flexDirection="column-reverse">
      {bus.map((message, idx) => (
        <p key={`${message}-${idx}`}>{message}</p>
      ))}
    </Flex>
  );
}

export { RoomBusDisplay };
