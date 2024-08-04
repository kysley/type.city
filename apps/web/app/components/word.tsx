import { useAtomValue } from "jotai";
import { PrimitiveAtom } from "jotai/vanilla";
import clsx from "clsx";
import { WordState, wordIndexAtom } from "../state";
import { memo } from "react";

type WordProps = {
  wordAtom: PrimitiveAtom<WordState>;
  className: string;
};

export function Word({ wordAtom, className }: WordProps) {
  const word = useAtomValue(wordAtom);
  const wordIndex = useAtomValue(wordIndexAtom);

  function overflow() {
    if (!word.input) return;

    if (word.input.length > word.word.length) {
      return word.input?.substring(word.word.length).split("");
    }

    return null;
  }

  if (word.key > wordIndex) {
    // return <span className="text-blue-500">{word.word}</span>;
    return <span className={className}>{word.word}</span>;
  }

  return (
    <p className={className}>
      {word.word.split("").map((letter, letterIndex) => (
        <span
          key={`${letterIndex},${letter}`}
          className={clsx(
            "letter",
            // Change the letter color when the cursor is over the letter
            letterIndex === word?.input.length && "foreground",
            word?.input[letterIndex] === word.word[letterIndex] &&
              "letter-correct",
            letterIndex < word?.input.length &&
              word?.input[letterIndex] !== word.word[letterIndex] &&
              "letter-incorrect",
            "inline-block"
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
