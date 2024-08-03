import { useAtomValue } from "jotai";
import { apmAtom } from "../state";

function useAPM() {
  const apm = useAtomValue(apmAtom);

  return apm;
}

export { useAPM };
