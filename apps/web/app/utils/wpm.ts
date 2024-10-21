export function calculateAPM({
	actions,
	time,
}: {
	actions: number;
	time: number;
}) {
	const durationSeconds = time;
	const apm = (actions / durationSeconds) * 60;
	return Math.round(apm);
}

// export function calculateWPM({
// 	index,
// 	time,
// 	wordsState,
// 	mistakes,
// }: {
// 	index: number;
// 	time: number;
// 	wordsState: WordState[];
// 	mistakes: number;
// }) {
// 	let correctLetters = 0;
// 	let incorrectLetters = 0;

// 	for (let i = 0; i <= index; i++) {
// 		const word = wordsState[i];
// 		if (!word) break;
// 		// if (word.perfect) correctLetters += word.name.length;

// 		word.word.split("").forEach((letter, index) => {
// 			// Check if the user has typed this far into the word
// 			if (word.input[index]) {
// 				// Correct letter
// 				if (word.input[index] === letter) {
// 					correctLetters += 1;
// 					// Incorrect letter
// 				} else {
// 					incorrectLetters += 1;
// 				}
// 			}
// 		});

// 		// Check the previous word if the user has either typed too many or too few letters
// 		// this is incorrect based on what you are supposed to type
// 		// therefore we count it towards accuracy as a more progressive calculation
// 		// Only check the previous word so live stats are not skewed towards not finishing the word yet
// 		// todo: will need to check the last word when checking a final submission
// 		const prevWord = wordsState[i - 1];
// 		if (prevWord) {
// 			console.log(prevWord);
// 			if (prevWord.input.length !== prevWord.word.length) {
// 				incorrectLetters += Math.abs(
// 					prevWord.word.length - prevWord.input.length,
// 				);
// 			}
// 		}
// 	}

// 	const wpm = Math.round(((correctLetters + index) * (60 / time)) / 5);
// 	const total = correctLetters + index + incorrectLetters + mistakes;
// 	const acc = (1 - (incorrectLetters + mistakes) / total) * 100;

// 	return { wpm, acc };
// }
