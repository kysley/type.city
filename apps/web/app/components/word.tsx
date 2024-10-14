import { useAtomValue } from "jotai";
import type { PrimitiveAtom } from "jotai/vanilla";
import clsx from "clsx";
import { type WordState, wordIndexAtom } from "../state";
import { useMemo } from "react";

type WordProps = {
	wordAtom: PrimitiveAtom<WordState>;
	className: string;
};

export function Word({ wordAtom, className }: WordProps) {
	const word = useAtomValue(wordAtom);
	const wordIndex = useAtomValue(wordIndexAtom);

	const letters = useMemo(() => {
		return word.word.split("");
	}, [word.word]);

	function overflow() {
		if (!word.input) return;

		if (word.input.length > word.word.length) {
			return word.input?.substring(word.word.length).split("");
		}

		return null;
	}

	// Pref - Render the word "normally" if its not current or previous index
	if (word.key > wordIndex) {
		return <span className={className}>{word.word}</span>;
	}

	// todo - get a className based on state + function for the letter variant

	const wordClass = clsx(className, word.key === 3 && "word-fogged");

	return (
		<p className={wordClass}>
			{letters.map((letter, letterIndex) => (
				<span
					key={`${letterIndex},${letter}`}
					className={clsx(
						"letter",
						// Change the letter color when the cursor is over the letter
						word.key === wordIndex &&
							letterIndex === word?.input.length &&
							"mirror",

						// word.key === 2 &&
						// 	word.input.length < letterIndex &&
						// 	"letter-fogged",
						// (word as ArcadeWordState).variant === WordVariant.FOG && ''

						word?.input[letterIndex] === word.word[letterIndex] &&
							"letter-correct",
						letterIndex < word?.input.length &&
							word?.input[letterIndex] !== word.word[letterIndex] &&
							"letter-incorrect",
						"inline-block",
					)}
				>
					{letter}
				</span>
			))}
			{overflow()?.map((letter, index) => (
				<span key={`${word.key},${letter},${index}`}>{letter}</span>
			))}
		</p>
	);
}
