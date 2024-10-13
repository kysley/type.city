import type { MetaFunction } from "@remix-run/node";
import {
	GameMode,
	GameState,
	gConditionAtom,
	gConditionOvrAtom,
	gModeTypeAtom,
	gSnapshotAtom,
	gStateAtom,
	snapshotAtom,
	wordIndexAtom,
	wordsAtomAtom,
} from "../state";
import { WordComposition } from "../components/word-list";
import { Fragment, useEffect } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useSyncInput } from "../hooks/use-sync-input";
import { SingleplayerGameEnd } from "../components/local-game-end-screen";
import {
	LocalGameActions,
	LocalGameRestart,
} from "../components/local/game-actions";
import { useNavigate } from "@remix-run/react";
import { useSocket } from "../hooks/use-socket";
import { useLocalClock } from "../hooks/use-local-clock";
import { useResetTypingState } from "../hooks/use-reset-local";
import { useAtomCallback } from "jotai/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LocalGameDisplay } from "../components/local/game-display";
import { ServerEvents, WordState } from "types";
import { Positions } from "../components/layout-positions";
import { Flex } from "@wwwares/ui-system/jsx";
import { Card } from "@wwwares/ui-react";
import { useSubmitTest } from "../hooks/use-submit-test";

export const meta: MetaFunction = () => {
	return [
		{ title: "type.city ⌨️" },
		{ name: "description", content: "Welcome to Remix!" },
	];
};

// export const loader = async () => {
//   const words = getWords(1000);
//   return json({ words });
// };

function useRoomRedirect() {
	const { socket } = useSocket();
	const navigate = useNavigate();

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		socket.on(ServerEvents.ROOM_CREATED, (data) => {
			navigate(`/room/${data}`);
		});
	}, []);

	return null;
}

// fetch("http://localhost:8013/temp", { method: "GET", credentials: "include" });
export default function Index() {
	const [words] = useAtom(wordsAtomAtom);
	const gState = useAtomValue(gStateAtom);

	useRoomRedirect();

	return (
		<Fragment>
			<WordSync />
			<SingleplayerController />

			{gState === GameState.DONE ? (
				<Positions.Center>
					<SingleplayerGameEnd maxWidth={undefined} width="100%" />
				</Positions.Center>
			) : (
				<Fragment>
					{words.length > 0 ? (
						<Fragment>
							<Positions.Center>
								<WordComposition words={words} />
							</Positions.Center>
							{/* <Positions.CenterBelow> */}
							<Flex
								gridColumn="2 / 2"
								gridRow="5 / 7"
								alignContent="center"
								justifyContent="flex-end"
								height="100%"
								margin="6"
							>
								<LocalGameRestart />
							</Flex>
							{/* </Positions.CenterBelow> */}
							<Positions.CenterAbove>
								<Card>
									{gState !== GameState.PLAYING ? (
										<LocalGameActions />
									) : (
										<LocalGameDisplay />
									)}
								</Card>
							</Positions.CenterAbove>
						</Fragment>
					) : null}
				</Fragment>
			)}
		</Fragment>
	);
}

// Stuffing a lot of logic into here really reduces page-level rerenders
function SingleplayerController() {
	const qc = useQueryClient();
	useLocalClock();

	const [gMode, setGMode] = useAtom(gModeTypeAtom);
	const clearOverride = useSetAtom(gConditionOvrAtom);
	const [gState, setGState] = useAtom(gStateAtom);
	const gCondition = useAtomValue(gConditionAtom);
	const wordIndex = useAtomValue(wordIndexAtom);
	const gSnapshot = useAtomValue(gSnapshotAtom);

	const { mutate } = useSubmitTest({ mode: undefined });

	const { resetState } = useResetTypingState();

	const snapshot = useAtomCallback((get, set) => {
		const snap = get(snapshotAtom);
		set(gSnapshotAtom, snap);
	});

	// If the user changes the number of words to race/sprint we need to reset state
	// biome-ignore lint/correctness/useExhaustiveDependencies: resetState doesn't need to be included
	useEffect(() => {
		const prevMode = localStorage.getItem("t2024_prevmode");
		if (prevMode) {
			setGMode(Number(prevMode));
			localStorage.removeItem("t2024_prevmode");
		}
		clearOverride(undefined);
		resetState();
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

export function WordSync() {
	useSyncInput();

	return null;
}
