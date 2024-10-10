import type { MetaFunction } from "@remix-run/node";
import {
	addStateToWord,
	GameMode,
	GameState,
	gConditionAtom,
	gConditionOvrAtom,
	gModeTypeAtom,
	gSnapshotAtom,
	gStateAtom,
	snapshotAtom,
	wordIndexAtom,
	wordsAtom,
	wordsAtomAtom,
} from "../state";
import { WordComposition } from "../components/word-list";
import { Fragment, useEffect } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useSyncInput } from "../hooks/use-sync-input";
import { LocalGameEndScreen } from "../components/local-game-end-screen";
import { Link, useNavigate } from "@remix-run/react";
import { useSocket } from "../hooks/use-socket";
import { useGameClock } from "../hooks/use-local-clock";
import { useResetTypingState } from "../hooks/use-reset-local";
import { useAtomCallback } from "jotai/utils";
import { useQuery } from "@tanstack/react-query";
import { LocalGameDisplay } from "../components/local/game-display";
import { ServerEvents, WordState } from "types";
import { Positions } from "../components/layout-positions";
import { Flex } from "@wwwares/ui-system/jsx";
import { Button, Card } from "@wwwares/ui-react";
import { req } from "../utils/ky";
import {
	IconAbc,
	IconArrowBack,
	IconHourglassHigh,
	IconRefresh,
} from "@tabler/icons-react";
import { useSubmitTest } from "../hooks/use-submit-test";
import { DailyLeaderboardModalButton } from "../components/daily/daily-leaderboard-modal";

export const meta: MetaFunction = () => {
	return [
		{ title: "daily typing test - type.city" },
		{ name: "description", content: "Welcome to Remix!" },
	];
};

function useDailyRoom() {
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

export default function Daily() {
	const setWords = useSetAtom(wordsAtom);
	const [words] = useAtom(wordsAtomAtom);
	const gState = useAtomValue(gStateAtom);

	const setConditionOvride = useSetAtom(gConditionOvrAtom);
	const setMode = useSetAtom(gModeTypeAtom);

	const { isSuccess, data } = useQuery({
		queryKey: ["daily"],
		queryFn: async () => {
			const data = await req.get("daily").json();
			return data;
		},
	});

	useEffect(() => {
		if (isSuccess && data) {
			setConditionOvride(data.condition as number);
			setMode((prev) => {
				localStorage.setItem("t2024_prevmode", prev.toString());
				return data.mode as GameMode;
			});
			setWords(
				(data.words as string).split(",").map((w, i) => addStateToWord(w, i)),
			);
		}
	}, [data, isSuccess]);

	if (!isSuccess) {
		return null;
	}

	return (
		<Fragment>
			<WordSync />
			<DailyController
			// gMode={data.mode}
			// gCondition={data.condition}
			// gState={gState}
			/>

			{gState === GameState.DONE ? (
				<Positions.Center>
					<LocalGameEndScreen />
				</Positions.Center>
			) : (
				<Fragment>
					{words.length > 0 ? (
						<Fragment>
							<Positions.Center>
								<WordComposition words={words} />
							</Positions.Center>
							<Flex
								gridColumn="2 / 2"
								gridRow="5 / 7"
								alignContent="center"
								justifyContent="flex-end"
								height="100%"
								margin="6"
							>
								<DailyRestartButton />
							</Flex>
							<Positions.CenterAbove>
								<Card>
									{gState !== GameState.PLAYING ? (
										<DailyActions
										// gCondition={data.condition}
										// gMode={data.mode}
										/>
									) : (
										<LocalGameDisplay
										// gMode={data.mode}
										// gCondition={data.condition}
										/>
									)}
								</Card>
							</Positions.CenterAbove>
							<Positions.CenterBelow>
								<DailyLeaderboardModalButton />
							</Positions.CenterBelow>
						</Fragment>
					) : null}
				</Fragment>
			)}
		</Fragment>
	);
}

function DailyActions(
	// {
	// gMode,
	// gCondition,
	// }: { gMode: GameMode; gCondition: number }
) {
	const gMode = useAtomValue(gModeTypeAtom);
	const gCondition = useAtomValue(gConditionAtom);
	return (
		<Flex gap="5" justifyContent="space-between" width="100%">
			<Flex>
				<span>
					{gMode === GameMode.LIMIT ? (
						<IconHourglassHigh style={{ display: "inline" }} />
					) : (
						<IconAbc style={{ display: "inline" }} size={30} />
					)}
					{gCondition}
				</span>
			</Flex>
			{/* // todo: need button variant for link. <a>button</a> is no good */}
			<Link to="/">
				{/* <Button variant={"icon"}> */}
				<IconArrowBack color="white" style={{ display: "inline" }} /> back
				{/* </Button> */}
			</Link>
		</Flex>
	);
}

function DailyRestartButton() {
	const { resetState } = useResetTypingState();

	return (
		<Button variant="icon" onPress={() => resetState({ resetWords: true })}>
			<IconRefresh color="white" />
		</Button>
	);
}

// Stuffing a lot of logic into here really reduces page-level rerenders
function DailyController(
	// 	{
	// 	gMode,
	// 	gCondition,
	// 	gState,
	// }: { gMode: GameMode; gCondition: number; gState: GameState }
) {
	const gMode = useAtomValue(gModeTypeAtom);
	const gCondition = useAtomValue(gConditionAtom);
	const setGState = useSetAtom(gStateAtom);
	const wordIndex = useAtomValue(wordIndexAtom);
	const gSnapshot = useAtomValue(gSnapshotAtom);
	const gState = useAtomValue(gStateAtom);

	useGameClock({
		mode: gMode,
		condition: gCondition,
	});

	const { mutate } = useSubmitTest({ mode: "daily" });

	const snapshot = useAtomCallback((get, set) => {
		const snap = get(snapshotAtom);
		set(gSnapshotAtom, snap);
	});

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
			console.log("bam");
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
