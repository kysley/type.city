import { Button, Card } from "@wwwares/ui-react";
import { useResetTypingState } from "../hooks/use-reset-local";
import { useAtomValue } from "jotai";
import { GameMode, gModeTypeAtom, gSnapshotAtom } from "../state";
import { StatShield } from "./stat-shield";
import { Box, Flex } from "@wwwares/ui-system/jsx";
import { Userbar } from "./userbar";

function LocalGameEndScreen() {
  const { resetState } = useResetTypingState();
  const gSnapshot = useAtomValue(gSnapshotAtom);
  const gMode = useAtomValue(gModeTypeAtom);

  return (
    <Card flexDirection="column" gap="4">
      <Flex alignItems="center" justifyContent="space-between" gap="10">
        <Box as="h2" fontSize="4xl" fontWeight="black" color="text.default">
          Times up.
        </Box>
        <Userbar />
      </Flex>
      <Flex gap="3" flexDirection="column" alignItems="flex-start" width="30%">
        <StatShield title="WPM" value={gSnapshot?.wpm} />
        <StatShield title="ACC" value={gSnapshot?.acc} />
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
