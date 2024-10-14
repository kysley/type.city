import { useAtom, useSetAtom, useAtomValue } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useEffect } from "react";
import { GameMode, type WordState } from "types";
import { useGameClock } from "../../hooks/use-local-clock";
import { useResetTypingState } from "../../hooks/use-reset-local";
import { useSubmitTest } from "../../hooks/use-submit-test";
import {
	gModeTypeAtom,
	gConditionOvrAtom,
	gStateAtom,
	gConditionAtom,
	wordIndexAtom,
	gSnapshotAtom,
	snapshotAtom,
	GameState,
} from "../../state";

// Stuffing a lot of logic into here really reduces page-level rerenders
function SingleplayerController({ mode = undefined }: { mode?: "daily" }) {
	const [gMode, setGMode] = useAtom(gModeTypeAtom);
	const clearOverride = useSetAtom(gConditionOvrAtom);
	const [gState, setGState] = useAtom(gStateAtom);
	const gCondition = useAtomValue(gConditionAtom);
	const wordIndex = useAtomValue(wordIndexAtom);
	const gSnapshot = useAtomValue(gSnapshotAtom);

	useGameClock({ condition: gCondition, mode: gMode });

	// const { mutate } = useSubmitTest({ mode: undefined });
	const { mutate } = useSubmitTest({ mode });

	const { resetState } = useResetTypingState();

	const snapshot = useAtomCallback((get, set) => {
		const snap = get(snapshotAtom);
		set(gSnapshotAtom, snap);
	});

	// If the user changes the number of words to race/sprint we need to reset state
	// biome-ignore lint/correctness/useExhaustiveDependencies: resetState doesn't need to be included
	useEffect(() => {
		if (mode !== "daily") {
			const prevMode = localStorage.getItem("t2024_prevmode");
			if (prevMode) {
				setGMode(Number(prevMode));
				localStorage.removeItem("t2024_prevmode");
			}
			clearOverride(undefined);
			resetState();
		}
	}, [gCondition, gMode]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (wordIndex === gCondition && gMode === GameMode.RACE) {
			snapshot();
			setGState(GameState.DONE);
			console.log("game condition has been reaache?D");
		}
	}, [wordIndex, gMode, gCondition, setGState]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (gState === GameState.DONE) {
			const { acc, apm, corrections, wordIndex, words, wpm } = gSnapshot as {
				wpm: number;
				acc: number;
				apm: number;
				wordIndex: number;
				words: WordState[];
				corrections: number;
			};
			mutate({
				result: {
					accuracy: acc,
					startTime: Date.now(),
					condition: gCondition,
					mode: gMode,
					state: words,
					wordIndex,
					wpm,
				},
			});
		}
	}, [gState]);

	return null;
}

export { SingleplayerController };
