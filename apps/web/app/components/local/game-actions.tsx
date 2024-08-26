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
    <Grid
      gridColumn={"3/ span 6"}
      gridRowStart="4"
      alignSelf="flex-end"
      alignItems="flex-end"
      gap="4"
      gridAutoFlow="column"
      justifyContent="flex-start"
    >
      <ChangeCursorButton />
      <Button onPress={() => socket.emit("client.room.create")}>
        Create game
      </Button>
      {/* {gModeType === GameMode.LIMIT ? (
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
      )} */}
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
              color={gCondition[GameMode.RACE] === count ? "white" : "gray.500"}
              onClick={() => {
                setGCondition((p) => ({ ...p, [GameMode.RACE]: count }));
              }}
            >
              {count} word
              {/* <IconTimeDuration60 title="Duration" color="white" /> */}
            </Box>
          );
        })}
      {/* <Select
        label="Test type"
        value={gModeType.toString()}
        onChange={(e) => setGModeType(Number(e.currentTarget.value))}
        options={[
          { label: "Duration", value: GameMode.LIMIT.toString() },
          { label: "Dash", value: GameMode.RACE.toString() },
        ]}
      /> */}
      {/* <span>{gTime}</span> */}
      {/* <span>{gSnapshot?.wpm || null}</span> */}
    </Grid>
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
