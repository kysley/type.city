import { useAtom, useSetAtom } from "jotai";
import {
	GameMode,
	GameState,
	gTimeAtom,
	gStateAtom,
	snapshotAtom,
	gSnapshotAtom,
} from "../state";
import { useEffect } from "react";
import { useAtomCallback } from "jotai/utils";
import * as timers from "react-timer-hook";

const { useTimer: useTimerNew, useStopwatch } = timers;

let startTime: number | null;
function useGameClock(
	{
		mode,
		condition,
		gameState,
		onTick,
	}: {
		mode: GameMode;
		condition: number;
		gameState?: GameState;
		onTick?(totalSeconds: number): void;
	},
	{ isServerGame = false } = {},
) {
	const [internalGameState, setGameState] = useAtom(gStateAtom);

	const state = gameState ?? internalGameState;

	const takeSnapshot = useAtomCallback((get, set) => {
		const snap = get(snapshotAtom);
		set(gSnapshotAtom, snap);

		return snap;
	});

	const setTimeAtom = useSetAtom(gTimeAtom);

	// Used when GameMode.LIMIT
	const limitTimer = useTimerNew({
		autoStart: false,
		onExpire() {
			// takeSnapshot();
			// We want to let server updates control the local state
			if (!isServerGame) {
				setGameState(GameState.DONE);
			}
		},
		expiryTimestamp: new Date(Date.now() + condition * 1000),
	});

	// Used when GameMode.RACE
	const raceTimer = useStopwatch({
		autoStart: false,
	});

	// Reset timer when key game properties change
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (mode === GameMode.LIMIT) {
			limitTimer.restart(new Date(Date.now() + condition * 1000), false);
		} else {
			raceTimer.reset();
		}
	}, [mode, condition]);

	// Sync timer based on GameState changing
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (mode === GameMode.LIMIT) {
			if (state === GameState.WAITING) {
				limitTimer.pause();
				limitTimer.restart(new Date(Date.now() + condition * 1000), false);
			} else if (state === GameState.PLAYING) {
				startTime = Date.now();
				limitTimer.start();
			}
		} else if (mode === GameMode.RACE) {
			if (state === GameState.WAITING) {
				raceTimer.pause();

				raceTimer.reset(undefined, false);
			} else if (state === GameState.PLAYING) {
				startTime = Date.now();
				raceTimer.start();
				// When the user finishes the words available
			} else if (state === GameState.DONE) {
				raceTimer.pause();
			}
		}
	}, [state]);

	// Sync clock time with game state
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (state !== GameState.PLAYING) return;
		takeSnapshot();
		if (mode === GameMode.LIMIT) {
			onTick?.(condition - limitTimer.totalSeconds);

			// set time counting up from 0 always
			setTimeAtom(condition - limitTimer.totalSeconds);
		} else {
			onTick?.(raceTimer.totalSeconds);
			setTimeAtom(raceTimer.totalSeconds);
		}
	}, [limitTimer.totalSeconds, raceTimer.totalSeconds]);

	return {};
}

export { useGameClock };
