import { Button } from "@wwwares/ui-react";
import { useResetTypingState } from "../hooks/use-reset-local";
import { useAtom, useAtomValue } from "jotai";
import { getShebang } from "typescript";
import { correctionsAtom, gSnapshotAtom } from "../state";
import { calculateAPM, calculateWPM } from "../utils/wpm";

function LocalGameEndScreen() {
  const { resetState } = useResetTypingState();
  const gSnapshot = useAtomValue(gSnapshotAtom);
  const corrections = useAtomValue(correctionsAtom);
  const wpm = calculateWPM({
    mistakes: corrections,
    index: gSnapshot?.wordIndex,
    time: 5,
    wordsState: gSnapshot.words,
  });
  return (
    <div>
      Game over.
      <Button
        intent="primary"
        onPress={() => {
          resetState();
          // inputRef.current?.focus();
        }}
      >
        reset
      </Button>
      {`apm: ${gSnapshot?.apm}`}
      {`wpm: ${wpm.wpm}`}
    </div>
  );
}

export { LocalGameEndScreen };
