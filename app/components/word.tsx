import { useAtomValue } from "jotai";
import { PrimitiveAtom } from "jotai/vanilla";
import clsx from "clsx";
import { WordState, wordIndexAtom } from "../state";

type WordProps = {
  wordAtom: PrimitiveAtom<WordState>;
};

export function Word({ wordAtom }: WordProps) {
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
    return <span className="">{word.word}</span>;
  }

  return (
    <>
      {word.word.split("").map((letter, letterIndex) => (
        <span
          key={`${letterIndex},${letter}`}
          className={clsx(
            // "word",
            // letterIndex > word?.input.length && "word",
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
    </>
  );
}
