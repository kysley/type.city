import { Box, Flex } from "@wwwares/ui-system/jsx";
import { ChangeCursorButton } from "../change-cursor-button";
import { useResetTypingState } from "../../hooks/use-reset-local";
import { IconBellSchool, IconNumber, IconRefresh } from "@tabler/icons-react";
import { useAtom } from "jotai";
import { GameMode, gModeConditionAtom, gModeTypeAtom } from "../../state";
import {
  Button,
  SegmentedControlGroup,
  SegmentedControlOption,
} from "@wwwares/ui-react";
import { useSocket } from "../../hooks/use-socket";

function LocalGameActions() {
  const { socket } = useSocket();
  const [gCondition, setGCondition] = useAtom(gModeConditionAtom);
  const [gModeType, setGModeType] = useAtom(gModeTypeAtom);

  return (
    <Flex
      // alignSelf="flex-end"
      alignItems="flex-end"
      // gridAutoFlow="column"
      justifyContent="space-between"
      height="100%"
    >
      <Flex gap="4">
        <Box
          onClick={() => {
            setGModeType(GameMode.LIMIT);
          }}
          color={gModeType === GameMode.LIMIT ? "white" : "gray.500"}
        >
          <IconBellSchool title="Duration" />
        </Box>

        <Box
          onClick={() => {
            setGModeType(GameMode.RACE);
          }}
          color={gModeType === GameMode.RACE ? "white" : "gray.500"}
        >
          <IconNumber title="Words" />
        </Box>

        <Box width="1px" height="100%" backgroundColor="red" />

        {gModeType === GameMode.LIMIT && (
          <SegmentedControlGroup
            value={gCondition[GameMode.LIMIT].toString()}
            onChange={(count) => {
              setGCondition((p) => ({ ...p, [GameMode.LIMIT]: Number(count) }));
            }}
          >
            <SegmentedControlOption title="15s" value={"15"} />
            <SegmentedControlOption title="30s" value={"30"} />
            <SegmentedControlOption title="45s" value={"45"} />
            <SegmentedControlOption title="60s" value={"60"} />
          </SegmentedControlGroup>
        )}
        {/*SEGMENTED CONTROL  */}
        {gModeType === GameMode.RACE && (
          <SegmentedControlGroup
            value={gCondition[GameMode.RACE].toString()}
            onChange={(count) => {
              setGCondition((p) => ({ ...p, [GameMode.RACE]: Number(count) }));
            }}
          >
            <SegmentedControlOption title="10 word" value={"10"} />
            <SegmentedControlOption title="25 word" value={"25"} />
            <SegmentedControlOption title="50 word" value={"50"} />
          </SegmentedControlGroup>
        )}
      </Flex>
      <Flex gap="2">
        <ChangeCursorButton />
        <Button onPress={() => socket.emit("client.room.create")}>
          Play online
        </Button>
      </Flex>
    </Flex>
  );
}

function LocalGameRestart() {
  const { resetState } = useResetTypingState();

  return (
    <Flex alignSelf="flex-start">
      <button type="button" onClick={() => resetState()}>
        <IconRefresh color="white" />
      </button>
    </Flex>
  );
}

export { LocalGameActions, LocalGameRestart };
