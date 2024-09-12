import { useAtomValue } from "jotai";
import {
  gModeConditionAtom,
  gModeTypeAtom,
  gProgressAtom,
  wpmAtom,
} from "../../state";
import { Flex, Grid } from "@wwwares/ui-system/jsx";
import { useDebounce, useThrottle } from "@uidotdev/usehooks";
import { GameMode } from "types";

function LocalGameDisplay() {
  const wpm = useAtomValue(wpmAtom);
  const progress = useAtomValue(gProgressAtom);
  const gMode = useAtomValue(gModeTypeAtom);
  const gCon = useAtomValue(gModeConditionAtom);

  const debouncedWpm = useThrottle(wpm.wpm, 600);
  // const debouncedAcc = useThrottle(wpm.acc, 600);

  const prog =
    gMode === GameMode.LIMIT
      ? `${gCon[gMode] - progress}s`
      : `${progress}/${gCon[gMode]}`;

  return (
    <Flex
      // alignSelf="flex-end"
      alignItems="flex-end"
      gap="4"
      gridAutoFlow="column"
      justifyContent="flex-start"
      height="100%"
    >
      <span>{prog}</span>
      <span>{debouncedWpm}</span>
    </Flex>
  );
}

export { LocalGameDisplay };
