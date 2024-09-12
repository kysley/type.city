import { Server } from "socket.io";
import { getWords, Seed } from "wordkit";
import { timerManager } from "./persisted-timeout";
import { wait } from "../utils";
import { GameMode, Room, RoomState, ServerEvents } from "types";
import { handleRelayRoomContinue } from "./relay";

export type RoomPlayer = {
  id: string;
  apm: number;
  letterIndex: number;
  wordIndex: number;
  cursorId?: string;
  userbarId?: string;
  isReady: boolean;
};

const seed = new Seed({ seed: process.env.LOCALDEVSEED });
export const roomLookup: Record<string, Room> = {
  localdev: {
    words: getWords(250, seed).split(","),
    gameId: "localdev",
    players: [],
    state: RoomState.LOBBY,
    mode: GameMode.LIMIT,
    condition: 60,
  },
};

async function handlePlayerRoomJoin(
  roomId: string,
  player: Partial<RoomPlayer>,
  server: Server
) {
  const room = roomLookup[roomId];

  if (!player.id) {
    throw "user with no id";
  }
  if (!room) {
    throw `[handlePlayerJoinRoom]: room with id ${roomId} does not exist`;
  }

  room.players.push({
    apm: 0,
    letterIndex: 0,
    wordIndex: 0,
    ...player,
    id: player.id,
    isReady: false,
  });

  // await socket.join(room.gameId);
  server.to(roomId).emit(ServerEvents.ROOM_JOIN, room);
  server.to(roomId).emit(ServerEvents.ROOM_BUS, "user joined room.");
  server.to(roomId).emit(ServerEvents.ROOM_UPDATE, room);

  await new Promise((resolve) => setTimeout(resolve, 3000));

  if (room.mode === GameMode.RELAY) {
    // No auto-start for now
    return;
  }

  if (room.players.length >= 2 && room.state === RoomState.LOBBY) {
    await triggerRoomCountdown(room.gameId, server);
  }
}
/**
 * Start the countdown for a room. also handles game cleanup
 */
async function triggerRoomCountdown(roomId: string, server: Server) {
  const room = roomLookup[roomId];

  if (!room) {
    throw `[triggerRoomCountdown]: room with id ${roomId} not found`;
  }

  room.state = RoomState.STARTING;
  server.to(roomId).emit(ServerEvents.ROOM_UPDATE, { state: room.state });

  // await new Promise((resolve) => setTimeout(resolve, 3000));
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

  if (room.mode === GameMode.LIMIT) {
    timerManager.setPersistedTimeout(
      roomId,
      () => {
        console.info(`[${roomId}]: GAME ENDING.`);

        room.state = RoomState.GAME_OVER;
        server
          .to(roomId)
          .emit(ServerEvents.ROOM_UPDATE, { state: RoomState.GAME_OVER });
      },
      room.condition * 1000
    );
  }

  // Manually restart the room for now
  // timerManager.setPersistedTimeout(
  //   roomId,
  //   () => {
  //     console.info(`[${roomId}]: ROOM RESTARTING.`);
  //     room.state = RoomState.LOBBY;
  //     server.to(roomId).emit(ServerEvents.ROOM_UPDATE, { state: RoomState.LOBBY });
  //   },
  //   15 * 1000
  // );
}

async function handlePlayerRoomReady(
  roomId: string,
  playerId: string,
  server: Server
) {
  const room = roomLookup[roomId];

  if (!room) {
    throw `[handlePlayerRoomReady]: room id ${roomId} doesn't exist`;
  }

  // Mark the player as ready on the server
  room.players = room.players.map((p) => {
    if (p.id === playerId) {
      return {
        ...p,
        isReady: true,
      };
    }
    return p;
  });

  server.to(roomId).emit(ServerEvents.ROOM_UPDATE, { players: room.players });

  const readyPlayersCount = room.players.filter(
    (player) => player.isReady
  ).length;

  // probably skip all ready requirement if not first leg of relay
  if (
    room.mode === GameMode.RELAY &&
    readyPlayersCount === room.players.length - 1
  ) {
    console.log("enough players ready for relay to start round");
    handleRelayRoomContinue(roomId, playerId, server);
    return;
  }

  if (readyPlayersCount >= 2) {
    room.players = room.players.map((p) => ({
      ...p,
      apm: 0,
      letterIndex: 0,
      wordIndex: 0,
      isReady: false,
    }));
    const words = getWords(250).split(",");
    room.words = words;
    triggerRoomCountdown(roomId, server);
  }
}

export { handlePlayerRoomJoin, handlePlayerRoomReady };
