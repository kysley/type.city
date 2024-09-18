import { useAtomValue } from "jotai";
import { GameState, gRoomStateAtom, snapshotAtom } from "../state";
import { ClientEvents, RoomState } from "types";
import { useAtomCallback } from "jotai/utils";
import { useSocket } from "./use-socket";
import { useGameClock } from "./use-local-clock";

function useRoomClock() {
	const room = useAtomValue(gRoomStateAtom);
	const { socket } = useSocket();

	const snapshot = useAtomCallback((get) => {
		return get(snapshotAtom);
	});

	function roomToGameState(roomState: RoomState): GameState {
		if (roomState === RoomState.IN_PROGRESS) {
			return GameState.PLAYING;
		}

		if (roomState === RoomState.LOBBY || roomState === RoomState.STARTING) {
			return GameState.WAITING;
		}

		return GameState.DONE;
	}

	useGameClock({
		mode: room?.mode,
		condition: room?.condition,
		state: roomToGameState(room?.state),
		onTick() {
			const snap = snapshot();
			socket?.emit(ClientEvents.UPDATE, { apm: snap.apm, wpm: snap.wpm });
		},
	});

	return null;
}

export { useRoomClock };
