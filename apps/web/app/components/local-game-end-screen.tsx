import { Button, Card } from "@wwwares/ui-react";
import { useResetTypingState } from "../hooks/use-reset-local";
import { useAtom, useAtomValue } from "jotai";
import { getShebang } from "typescript";
import { correctionsAtom, gModeConditionAtom, gSnapshotAtom } from "../state";
import { calculateAPM, calculateWPM } from "../utils/wpm";
import { StatShield } from "./stat-shield";
import { Box, Flex } from "@wwwares/ui-system/jsx";
import { Userbar } from "./userbar";

function LocalGameEndScreen() {
  const { resetState } = useResetTypingState();
  const gSnapshot = useAtomValue(gSnapshotAtom);
  const corrections = useAtomValue(correctionsAtom);
  const gCondition = useAtomValue(gModeConditionAtom);

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
      </Flex>
      <Button
        intent="primary"
        onPress={() => {
          resetState();
          // inputRef.current?.focus();
        }}
      >
        Play again
      </Button>
    </Card>
  );
}

export { LocalGameEndScreen };
