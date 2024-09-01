import { useAtomValue } from "jotai";
import { gProgressAtom, wpmAtom } from "../../state";
import { Grid } from "@wwwares/ui-system/jsx";
import { useDebounce, useThrottle } from "@uidotdev/usehooks";

function LocalGameDisplay() {
  const wpm = useAtomValue(wpmAtom);
  const progress = useAtomValue(gProgressAtom);

  const debouncedWpm = useThrottle(wpm.wpm, 600);
  const debouncedAcc = useThrottle(wpm.acc, 600);

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
      wpm: {debouncedWpm ?? null}
      acc: {debouncedAcc ?? null}
      progress: {progress}
    </Grid>
  );
}

export { LocalGameDisplay };
