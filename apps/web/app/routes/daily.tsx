import type { MetaFunction } from "@remix-run/node";
import {
	addStateToWord,
	GameMode,
	GameState,
	gConditionAtom,
	gConditionOvrAtom,
	gModeTypeAtom,
	gStateAtom,
	wordsAtom,
	wordsAtomAtom,
} from "../state";
import { WordComposition } from "../components/word-list";
import { Fragment, useEffect } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Link, useNavigate } from "@remix-run/react";
import { useSocket } from "../hooks/use-socket";
import { useResetTypingState } from "../hooks/use-reset-local";
import { useQuery } from "@tanstack/react-query";
import { LocalGameDisplay } from "../components/local/game-display";
import { ServerEvents } from "types";
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
import { DailyLeaderboardModalButton } from "../components/daily/daily-leaderboard-modal";
import { SingleplayerController } from "../components/local/singleplayer-controller";
import { WordSync } from "../components/local/word-sync";
import { SingleplayerGameEnd } from "../components/local-game-end-screen";

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
			<SingleplayerController mode="daily" />

			{gState === GameState.DONE ? (
				<Positions.Center>
					<SingleplayerGameEnd />
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
										<DailyActions />
									) : (
										<LocalGameDisplay />
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

function DailyActions() {
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
