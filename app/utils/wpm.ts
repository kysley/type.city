import { WordState } from "../state";

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

export function calculateWPM({
  index,
  time,
  wordsState,
  mistakes,
}: {
  index: number;
  time: number;
  wordsState: WordState[];
  mistakes: number;
}) {
  let correctLetters = 0;
  let incorrectLetters = 0;

  for (let i = 0; i <= index; i++) {
    const word = wordsState[i];
    if (!word) break;
    // if (word.perfect) correctLetters += word.name.length;

    word.word.split("").forEach((letter, index) => {
      if (word.input[index]) {
        if (word.input[index] === letter) {
          correctLetters += 1;
        } else if (
          index < word.input.length - 1 &&
          word.input[index] !== letter
        ) {
          incorrectLetters += 1;
        }
      }
    });
  }
  const wpm = Math.round(((correctLetters + index) * (60 / time)) / 5);
  const total = correctLetters + index + incorrectLetters + mistakes;
  const acc = (1 - (incorrectLetters + mistakes) / total) * 100;

  console.log(acc);

  return { wpm, acc };
}
