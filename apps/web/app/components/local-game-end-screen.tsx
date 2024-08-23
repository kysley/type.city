import { Button, Card } from "@wwwares/ui-react";
import { useResetTypingState } from "../hooks/use-reset-local";
import { useAtomValue } from "jotai";
import {
  correctionsAtom,
  GameMode,
  gConditionAtom,
  gModeTypeAtom,
  gSnapshotAtom,
} from "../state";
import { calculateWPM } from "../utils/wpm";
import { StatShield } from "./stat-shield";
import { Box, Flex } from "@wwwares/ui-system/jsx";
import { Userbar } from "./userbar";

function LocalGameEndScreen() {
  const { resetState } = useResetTypingState();
  const gSnapshot = useAtomValue(gSnapshotAtom);
  const corrections = useAtomValue(correctionsAtom);
  const gCondition = useAtomValue(gConditionAtom);
  const gMode = useAtomValue(gModeTypeAtom);

  // since this isn't live use the test duration?
  const wpm = calculateWPM({
    mistakes: corrections,
    index: gSnapshot?.wordIndex || 0,
    time: gCondition,
    wordsState: gSnapshot?.words || [],
  });

  return (
    <Card flexDirection="column" gap="4">
      <Flex alignItems="center" justifyContent="space-between" gap="10">
        <Box as="h2" fontSize="4xl" fontWeight="black" color="text.default">
          Times up.
        </Box>
        <Userbar />
      </Flex>
      <Flex gap="3" flexDirection="column" alignItems="flex-start" width="30%">
        <StatShield title="WPM" value={wpm.wpm} />
        <StatShield title="ACC" value={wpm.acc} />
        <StatShield title="APM" value={gSnapshot?.apm || 0} />
        <StatShield
          title="Mode"
          value={gMode === GameMode.RACE ? "Words" : "Time"}
        />
      </Flex>
      <Flex>
        <Button
          intent="primary"
          onPress={() => {
            resetState();
            // inputRef.current?.focus();
          }}
        >
          Next test
        </Button>
        <Button
          intent="neutral"
          onPress={() => {
            resetState({ resetWords: true });
          }}
        >
          Repeat words
        </Button>
      </Flex>
    </Card>
  );
}

export { LocalGameEndScreen };
