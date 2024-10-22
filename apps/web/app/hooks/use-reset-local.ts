import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Seed } from "@wwwares/seed-kit";
import {
	wordsAtom,
	wordIndexAtom,
	inputAtom,
	lineBreakCountAtom,
	hideWordsUnderIndexAtom,
	lineBreakIndicesAtom,
	gStateAtom,
	gTimeAtom,
	GameState,
	actionsCountAtom,
	hideWordsOverIndexAtom,
	correctionsAtom,
	refocusAtom,
	gModeTypeAtom,
	gConditionAtom,
	gSnapshotAtom,
	seedAtom,
	startTimeAtom,
} from "../state";
import { WordFinishState } from "types";

export function useResetTypingState() {
	const gCondition = useAtomValue(gConditionAtom);
	const gMode = useAtomValue(gModeTypeAtom);

	const [seed, setSeed] = useAtom(seedAtom);

	const setStartTime = useSetAtom(startTimeAtom);
	const setWordsAtom = useSetAtom(wordsAtom);
	const setWordIndexAtom = useSetAtom(wordIndexAtom);
	const setInputAtom = useSetAtom(inputAtom);
	const setLineBreakCountAtom = useSetAtom(lineBreakCountAtom);
	const setHideUnderAtom = useSetAtom(hideWordsUnderIndexAtom);
	const setHideOverAtom = useSetAtom(hideWordsOverIndexAtom);
	const setBreakIndicesAtom = useSetAtom(lineBreakIndicesAtom);
	const setGState = useSetAtom(gStateAtom);
	const setGTime = useSetAtom(gTimeAtom);
	const setGSnapshotAtom = useSetAtom(gSnapshotAtom);
	const setActionCount = useSetAtom(actionsCountAtom);
	const setCorrections = useSetAtom(correctionsAtom);
	const setRefocus = useSetAtom(refocusAtom);

	function resetState({
		includeWords = true,
		resetWords = false,
		includeTime = true,
		includeState = true,
	} = {}) {
		// actually the generation time
		let startTime = 0;

		if (includeWords) {
			// invalidate start time if resetting- not valid for submission
			if (resetWords) {
				setWordsAtom((p) =>
					p.map((word, index) => ({
						...word,
						input: "",
						finishState: WordFinishState.UNFINISHED,
					})),
				);
			} else {
				startTime = Date.now();
				const seedPhrase = `${gMode},${gCondition},${startTime}`;
				const nextSeed = new Seed({ seed: seedPhrase });
				setSeed(nextSeed);
			}
		}
		setGSnapshotAtom(undefined);
		setStartTime(startTime);
		setWordIndexAtom(0);
		setInputAtom("");
		setLineBreakCountAtom(0);
		setHideUnderAtom(0);
		setBreakIndicesAtom([]);
		if (includeState) {
			setGState(GameState.WAITING);
		}
		setHideOverAtom({ cursorLimit: 0, wordLimit: 0 });
		if (includeTime) {
			setGTime(0);
		}
		setActionCount(0);
		setCorrections(0);
		setRefocus((p) => p + 1);

		return { startTime };
	}

	return {
		resetState,
	};
}
