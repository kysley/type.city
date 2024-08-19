import { Flex } from "@wwwares/ui-system/jsx";
import { ChangeCursorButton } from "../change-cursor-button";
import { useResetTypingState } from "../../hooks/use-reset-local";
import { IconRefresh } from "@tabler/icons-react";
import { useAtom, useAtomValue } from "jotai";
import {
  GameMode,
  gModeConditionAtom,
  gModeTypeAtom,
  gSnapshotAtom,
  gTimeAtom,
} from "../../state";
import { Button, Select } from "@wwwares/ui-react";
import { useSocket } from "../../hooks/use-socket";

function LocalGameActions() {
  const { socket } = useSocket();
  const gTime = useAtomValue(gTimeAtom);
  const gSnapshot = useAtomValue(gSnapshotAtom);
  const [gCondition, setGCondition] = useAtom(gModeConditionAtom);
  const [gModeType, setGModeType] = useAtom(gModeTypeAtom);

  return (
    <Flex
      gridColumn={"3/ span 6"}
      gridRowStart="4"
      alignSelf="flex-end"
      alignItems="flex-end"
      gap="4"
    >
      <ChangeCursorButton />
      <Button onPress={() => socket.emit("client.room.create")}>
        Create game
      </Button>
      {gModeType === GameMode.LIMIT ? (
        <Select
          label="Test duration"
          value={gCondition.toString()}
          // https://www.reddit.com/r/reactjs/comments/1at3e10/why_is_typescript_saying_etargetvalue_doesnt/
          onChange={(e) => setGCondition(Number(e.currentTarget.value))}
          options={[
            { label: "5 seconds", value: "5" },
            { label: "30 seconds", value: "30" },
          ]}
        />
      ) : (
        <Select
          label="Word count"
          value={gCondition.toString()}
          onChange={(e) => setGCondition(Number(e.currentTarget.value))}
          options={[
            { label: "5 words", value: "5" },
            { label: "30 words", value: "30" },
          ]}
        />
      )}
      <Select
        label="Test type"
        value={gModeType.toString()}
        onChange={(e) => setGModeType(Number(e.currentTarget.value))}
        options={[
          { label: "Duration", value: GameMode.LIMIT.toString() },
          { label: "Dash", value: GameMode.RACE.toString() },
        ]}
      />
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
