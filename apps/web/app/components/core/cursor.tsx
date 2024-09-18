import { Box } from "@wwwares/ui-system/jsx";
import { useAtom, useAtomValue } from "jotai";
import { RefObject, useState, useRef, useLayoutEffect } from "react";
import {
	wordIndexAtom,
	inputAtom,
	cursorAtom,
	lineBreakCountAtom,
} from "../../state";

export function Cursor({
	container,
	cursorId,
}: {
	container: RefObject<HTMLDivElement>;
	cursorId?: string;
}) {
	const [wordIndex] = useAtom(wordIndexAtom);
	const [val] = useAtom(inputAtom);
	const [pos, setpos] = useState([0, 0]);
	const storedCursorId = useAtomValue(cursorAtom);
	const secondLineY = useRef(0);

	const [timesBroken] = useAtom(lineBreakCountAtom);

	// Cursor left/right
	// biome-ignore lint/correctness/useExhaustiveDependencies: container is a ref object, dont need to add timesBroken either
	useLayoutEffect(() => {
		if (container.current) {
			const word = container.current.children.item(wordIndex);

			let letter: HTMLDivElement | null = null;

			if (!word) return;

			const isLastLetter = val.length === word.children.length;

			// If the next word is on a new line
			letter = word.children.item(
				isLastLetter ? val.length - 1 : val.length,
			) as HTMLDivElement;

			if (letter) {
				// const { left, right, y } = letter.getBoundingClientRect();
				if (wordIndex === 0) {
					secondLineY.current = 0;
				}

				// const vec1 = !isLastLetter ? left : right;
				const vec1 = !isLastLetter
					? letter.offsetLeft
					: letter.offsetLeft + letter.offsetWidth;
				// const vec2 = secondLineY.current || y;
				const vec2 = secondLineY.current || letter.offsetTop;

				// Keep the y value for the second line
				if (timesBroken === 1 && secondLineY.current === 0) {
					// secondLineY.current = y;
					secondLineY.current = letter.offsetTop;
				}

				setpos([vec1, vec2]);
			}
		}
	}, [val, wordIndex]);

	return (
		<Box
			position="absolute"
			height="8"
			width="2"
			className={`caret caret${cursorId ?? storedCursorId}`}
			style={{
				left: pos[0],
				top: pos[1],
				marginTop: 4,
				// backgroundImage: `url('${cursorUrl}')`,
			}}
		/>
	);
}
