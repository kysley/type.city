import { Flex } from "@wwwares/ui-system/jsx";
import { ChangeCursorButton } from "../change-cursor-button";
import { useResetTypingState } from "../../hooks/use-reset-local";
import { IconRefresh } from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import { focusAtom } from "../../state";
import { Button } from "@wwwares/ui-react";
import { useSocket } from "../../hooks/use-socket";

function LocalGameActions() {
  const { socket } = useSocket();

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
      {/* <Button
        intent="primary"
        onPress={() => {
          resetState();
          // inputRef.current?.focus();
        }}
      >
        reset
      </Button> */}
    </Flex>
  );
}

export { LocalGameActions, LocalGameRestart };
