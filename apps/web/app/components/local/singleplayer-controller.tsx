import { useAtom, useSetAtom, useAtomValue } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useEffect } from "react";
import {
	GameMode,
	getWordGenCount,
	WordFinishState,
	type WordState,
} from "types";
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
	seedAtom,
	wordsAtom,
	addStateToWord,
} from "../../state";
import { getWords, Seed } from "@wwwares/seed-kit";

function useSeedSync({ mode = undefined }: { mode?: "daily" }) {
	const [gMode, _] = useAtom(gModeTypeAtom);
	const gCondition = useAtomValue(gConditionAtom);
	const seed = useAtomValue(seedAtom);
	const setWordsAtom = useSetAtom(wordsAtom);

	// If Game mode or condition changes, create new seed and set words
	useEffect(() => {
		if (mode !== "daily") {
			// Adding date for salt, can also add on a random seed if needed.
			// maybe keep track of date.now for submission validation
			const seedPhrase = `${gMode},${gCondition},${Date.now()}`;
			const nextSeed = new Seed({ seed: seedPhrase });
			const wordNum = getWordGenCount(gMode, gCondition);
			const nextWords = getWords(wordNum, nextSeed).words;

			setWordsAtom(
				nextWords.split(",").map((word, idx) => addStateToWord(word, idx)),
			);
		}
	}, [gMode, gCondition]);

	// If seed changes, generate and set words based on the seed
	useEffect(() => {
		const wordNum = getWordGenCount(gMode, gCondition);
		const nextWords = getWords(wordNum, seed).words;

		setWordsAtom(
			nextWords.split(",").map((word, idx) => addStateToWord(word, idx)),
		);
	}, [seed]);

	return null;
}

// Stuffing a lot of logic into here really reduces page-level rerenders
function SingleplayerController({ mode = undefined }: { mode?: "daily" }) {
	const [gMode, setGMode] = useAtom(gModeTypeAtom);
	const clearOverride = useSetAtom(gConditionOvrAtom);
	const [gState, setGState] = useAtom(gStateAtom);
	const gCondition = useAtomValue(gConditionAtom);
	const wordIndex = useAtomValue(wordIndexAtom);
	const gSnapshot = useAtomValue(gSnapshotAtom);
	const seed = useAtomValue(seedAtom);

	useGameClock({ condition: gCondition, mode: gMode });
	useSeedSync({ mode });

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

	// useEffect(() => {
	// 	// resetState({ seedValue: seed._seed.toString() });
	// 	setWordsAtom(
	// 		getWords(getWordGenCount(gMode, gCondition), seed)
	// 			.split(",")
	// 			.map((word, index) => ({
	// 				word,
	// 				input: "",
	// 				finishState: WordFinishState.UNFINISHED,
	// 				key: index,
	// 				backspaced: false,
	// 			})),
	// 	);
	// }, [seed]);

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
			const { acc, apm, corrections, wordIndex, words, wpm, eslapsed } =
				gSnapshot as {
					wpm: number;
					acc: number;
					apm: number;
					wordIndex: number;
					words: WordState[];
					corrections: number;
					eslapsed: number;
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
					seed: seed.state.seed,
					eslapsed,
					corrections,
				},
			});
		}
	}, [gState]);

	return null;
}

export { SingleplayerController };
