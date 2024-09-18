import { Server } from "socket.io";
import { roomLookup } from "./rooms";
import { GameMode, RoomState, ServerEvents } from "types";
import { getWords } from "wordkit";
import { wait } from "../utils";

export async function handleRaceEnd(roomId: string, server: Server) {
	const room = roomLookup[roomId];
	if (room?.mode !== GameMode.RACE) {
		throw `${roomId} is not race`;
	}

	room.state = RoomState.GAME_OVER;

	console.log("ending race");
	server.to(roomId).emit(ServerEvents.ROOM_UPDATE, room);
}

export async function handleRelayRoomLegEnd(roomId: string, server: Server) {}

export async function handleRelayRoomContinue(
	roomId: string,
	playerId: string,
	server: Server,
) {
	const room = roomLookup[roomId];
	if (room?.mode !== GameMode.RELAY) {
		throw `${roomId} is not relay`;
	}

	const words = getWords(250);

	room.words = words.split(",");

	// reset player progress
	// need to save this for comparisons across legs of the relay
	room.players = room.players.map((p) => ({
		...p,
		apm: 0,
		letterIndex: 0,
		wordIndex: 0,
		isReady: false,
	}));

	room.meta ??= {};

	room.meta.leg ??= (room.meta.leg || 0) + 1;

	room.state === RoomState.STARTING;

	server.to(roomId).emit(ServerEvents.ROOM_UPDATE, room);

	await wait(3000);

	server.to(roomId).emit(ServerEvents.ROOM_COUNTDOWN, 3);
	server.to(roomId).emit(ServerEvents.ROOM_BUS, "3...");

	await wait(1000);

	server.to(roomId).emit(ServerEvents.ROOM_COUNTDOWN, 2);
	server.to(roomId).emit(ServerEvents.ROOM_BUS, "2...");

	await wait(1000);

	server.to(roomId).emit(ServerEvents.ROOM_COUNTDOWN, 1);
	server.to(roomId).emit(ServerEvents.ROOM_BUS, "1...");

	await wait(1000);

	// emitting a bunch here right after one another... await?

	server.to(roomId).emit(ServerEvents.ROOM_COUNTDOWN, 0);
	server.to(roomId).emit(ServerEvents.ROOM_BUS, "Go!");

	room.state = RoomState.IN_PROGRESS;
	server.to(roomId).emit(ServerEvents.ROOM_UPDATE, { state: room.state });
}
