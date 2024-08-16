import { Flex } from "@wwwares/ui-system/jsx";
import { ChangeCursorButton } from "../change-cursor-button";
import { useResetTypingState } from "../../hooks/use-reset-local";
import { IconRefresh } from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import { gSnapshotAtom, gTimeAtom } from "../../state";
import { Button } from "@wwwares/ui-react";
import { useSocket } from "../../hooks/use-socket";

function LocalGameActions() {
  const { socket } = useSocket();
  const gTime = useAtomValue(gTimeAtom);
  const gSnapshot = useAtomValue(gSnapshotAtom);

  return (
    <Flex
      gridColumn={"3/ span 6"}
      gridRowStart="4"
      alignSelf="flex-end"
      gap="4"
    >
      <ChangeCursorButton />
      <Button onPress={() => socket.emit("client.room.create")}>
        Create game
      </Button>
      <span>{gTime}</span>
      <span>{gSnapshot?.wpm || null}</span>
    </Flex>
  );
}

function LocalGameRestart() {
  const { resetState } = useResetTypingState();

  return (
    <Flex gridColumn={"3/3"} gridRowStart="6" alignSelf="flex-start" gap="4">
      <button type="button" onClick={() => resetState()}>
        <IconRefresh color="white" />
      </button>
    </Flex>
  );
}

export { LocalGameActions, LocalGameRestart };
