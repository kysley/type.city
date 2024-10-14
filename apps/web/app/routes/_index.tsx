import type { MetaFunction } from "@remix-run/node";
import { GameState, gStateAtom, wordsAtomAtom } from "../state";
import { WordComposition } from "../components/word-list";
import { Fragment, useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { SingleplayerGameEnd } from "../components/local-game-end-screen";
import {
	LocalGameActions,
	LocalGameRestart,
} from "../components/local/game-actions";
import { useNavigate } from "@remix-run/react";
import { useSocket } from "../hooks/use-socket";
import { LocalGameDisplay } from "../components/local/game-display";
import { ServerEvents } from "types";
import { Positions } from "../components/layout-positions";
import { Flex } from "@wwwares/ui-system/jsx";
import { Card } from "@wwwares/ui-react";
import { SingleplayerController } from "../components/local/singleplayer-controller";
import { WordSync } from "../components/local/word-sync";

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
