import { Box, Flex, Grid } from "@wwwares/ui-system/jsx";
import { ChangeCursorButton } from "../change-cursor-button";
import { useResetTypingState } from "../../hooks/use-reset-local";
import { IconBellSchool, IconNumber, IconRefresh } from "@tabler/icons-react";
import { useAtom } from "jotai";
import { GameMode, gModeConditionAtom, gModeTypeAtom } from "../../state";
import { Button } from "@wwwares/ui-react";
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
        {gModeType === GameMode.LIMIT &&
          [15, 30, 45, 60].map((count) => {
            return (
              <Box
                color={
                  gCondition[GameMode.LIMIT] === count ? "white" : "gray.500"
                }
                onClick={() => {
                  setGCondition((p) => ({ ...p, [GameMode.LIMIT]: count }));
                }}
                key={count}
              >
                {count}s
                {/* <IconTimeDuration60 title="Duration" color="white" /> */}
              </Box>
            );
          })}
        {/*SEGMENTED CONTROL  */}
        {gModeType === GameMode.RACE &&
          [10, 25, 50].map((count) => {
            return (
              <Box
                key={count}
                color={
                  gCondition[GameMode.RACE] === count ? "white" : "gray.500"
                }
                onClick={() => {
                  setGCondition((p) => ({ ...p, [GameMode.RACE]: count }));
                }}
              >
                {count} word
                {/* <IconTimeDuration60 title="Duration" color="white" /> */}
              </Box>
            );
          })}
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
