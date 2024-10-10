import { useAtomValue } from "jotai";
import {
	gConditionAtom,
	gModeTypeAtom,
	gProgressAtom,
	wpmAtom,
} from "../../state";
import { Flex } from "@wwwares/ui-system/jsx";
import { useThrottle } from "@uidotdev/usehooks";
import { GameMode } from "types";

function useGameProgress(gCondition: number) {}

function LocalGameDisplay() {
	const wpm = useAtomValue(wpmAtom);
	const progress = useAtomValue(gProgressAtom);
	const gCondition = useAtomValue(gConditionAtom);
	const gMode = useAtomValue(gModeTypeAtom);

	const debouncedWpm = useThrottle(wpm.wpm, 600);
	// const debouncedAcc = useThrottle(wpm.acc, 600);

	const prog =
		gMode === GameMode.LIMIT
			? `${gCondition - progress}s`
			: `${progress}/${gCondition}`;

	return (
		<Flex
			// alignSelf="flex-end"
			alignItems="flex-end"
			gap="4"
			gridAutoFlow="column"
			justifyContent="flex-start"
			height="100%"
		>
			<span>{prog}</span>
			<span>{debouncedWpm}</span>
		</Flex>
	);
}

export { LocalGameDisplay };
