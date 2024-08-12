import { Server } from "socket.io";
import { getWords, Seed } from "wordkit";
import { RoomState } from "./multiplayer.types";
import { timerManager } from "./persisted-timeout";
import { wait } from "../utils";

export type RoomPlayer = {
  id: string;
  apm: number;
  letterIndex: number;
  wordIndex: number;
  cursorId?: string;
  userbarId?: string;
  isReady: boolean;
};

export type Room = {
  gameId: string;
  players: RoomPlayer[];
  words: string[];
  state: RoomState;
};

const seed = new Seed({ seed: process.env.LOCALDEVSEED });
export const roomLookup: Record<string, Room> = {
  localdev: {
    words: getWords(250, seed).split(","),
    gameId: "localdev",
    players: [],
    state: RoomState.LOBBY,
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
  server.to(roomId).emit("server.room.join", room);
  server.to(roomId).emit("room.bus", "user joined room.");
  server.to(roomId).emit("room.update", room);

  await new Promise((resolve) => setTimeout(resolve, 3000));

  // don't auto start for now- allow player ready event to handle that
  if (room.players.length >= 2 && room.state === RoomState.LOBBY) {
    await triggerRoomCountdown(room.gameId, server);
    // room.state = RoomState.STARTING;
    // server.to(roomId).emit("room.update", { state: room.state });
    // await new Promise((resolve) => setTimeout(resolve, 3000));
    // // start game countdown
    // setTimeout(() => {
    //   server.to(roomId).emit("room.countdown", 3);
    //   server.to(roomId).emit("room.bus", "3...");
    // }, 1000);
    // setTimeout(() => {
    //   server.to(roomId).emit("room.countdown", 2);
    //   server.to(roomId).emit("room.bus", "2...");
    // }, 2000);
    // setTimeout(() => {
    //   server.to(roomId).emit("room.countdown", 1);
    //   server.to(roomId).emit("room.bus", "1...");
    // }, 3000);
    // // artificial wait for the countdown and start the game
    // room.state = RoomState.IN_PROGRESS;
    // server.to(roomId).emit("room.update", { state: room.state });
    // timerManager.setPersistedTimeout(
    //   roomId,
    //   () => {
    //     console.info(`[${roomId}]: GAME ENDING.`);
    //     room.state = RoomState.GAME_OVER;
    //     server.to(roomId).emit("room.update", { state: RoomState.GAME_OVER });
    //   },
    //   30 * 1000
    // );
    // // Manually restart the room for now
    // timerManager.setPersistedTimeout(
    //   roomId,
    //   () => {
    //     console.info(`[${roomId}]: ROOM RESTARTING.`);
    //     room.state = RoomState.LOBBY;
    //     server.to(roomId).emit("room.update", { state: RoomState.LOBBY });
    //   },
    //   15 * 1000
    // );
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
  server.to(roomId).emit("room.update", { state: room.state });

  // await new Promise((resolve) => setTimeout(resolve, 3000));
  await wait(3000);

  server.to(roomId).emit("room.countdown", 3);
  server.to(roomId).emit("room.bus", "3...");

  await wait(1000);

  server.to(roomId).emit("room.countdown", 2);
  server.to(roomId).emit("room.bus", "2...");

  await wait(1000);

  server.to(roomId).emit("room.countdown", 1);
  server.to(roomId).emit("room.bus", "1...");

  await wait(1000);

  // emitting a bunch here right after one another... await?

  server.to(roomId).emit("room.countdown", 0);
  server.to(roomId).emit("room.bus", "Go!");

  room.state = RoomState.IN_PROGRESS;
  server.to(roomId).emit("room.update", { state: room.state });

  timerManager.setPersistedTimeout(
    roomId,
    () => {
      console.info(`[${roomId}]: GAME ENDING.`);
      room.state = RoomState.GAME_OVER;
      server.to(roomId).emit("room.update", { state: RoomState.GAME_OVER });
    },
    30 * 1000
  );

  // Manually restart the room for now
  timerManager.setPersistedTimeout(
    roomId,
    () => {
      console.info(`[${roomId}]: ROOM RESTARTING.`);
      room.state = RoomState.LOBBY;
      server.to(roomId).emit("room.update", { state: RoomState.LOBBY });
    },
    15 * 1000
  );
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

  server.to(roomId).emit("room.update", { players: room.players });

  const readyPlayersCount = room.players.filter(
    (player) => player.isReady
  ).length;

  if (readyPlayersCount >= 2) {
    triggerRoomCountdown(roomId, server);
  }
}

export { handlePlayerRoomJoin, handlePlayerRoomReady };
