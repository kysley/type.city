import { useAtomValue, useSetAtom } from "jotai";
import {
	currentWordAtom,
	GameState,
	gStateAtom,
	inputAtom,
	wordIndexAtom,
} from "../state";
import { useEffect, useRef } from "react";

function useSyncInput() {
	const gState = useAtomValue(gStateAtom);
	const currentWord = useAtomValue(currentWordAtom);
	const wordIndex = useAtomValue(wordIndexAtom);

	const prevWordIndex = useRef(wordIndex);

	const setInput = useSetAtom(inputAtom);

	// gState has been added to only check this if the user is playing. A race condition / bug was introduced here when refactoring seeding and resetting words
	useEffect(() => {
		// Check if the user has backspaced through a word. Checking if 51 (previous) is larger than 50 (current)
		// We need to do this so the user is editing exactly what they had before they hit space
		if (
			prevWordIndex.current > wordIndex &&
			currentWord &&
			gState === GameState.PLAYING
		) {
			console.info("setting previous input", currentWord.input);
			setInput(currentWord.input);
		}

		prevWordIndex.current = wordIndex;
	}, [wordIndex, currentWord, setInput, gState]);

	return null;
}

export { useSyncInput };
