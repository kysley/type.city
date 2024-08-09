import { Server } from "socket.io";
import { getWords, Seed } from "wordkit";
import { RoomState } from "./multiplayer.types";
import { timerManager } from "./persisted-timeout";

export type RoomPlayer = {
  id: string;
  apm: number;
  letterIndex: number;
  wordIndex: number;
  cursorId?: string;
  userbarId?: string;
};

const seed = new Seed({ seed: process.env.LOCALDEVSEED });
export const roomLookup: Record<
  string,
  { gameId: string; players: RoomPlayer[]; words: string[]; state: RoomState }
> = {
  localdev: {
    words: getWords(250, seed).split(","),
    gameId: "localdev",
    players: [],
    state: RoomState.LOBBY,
  },
};

async function handlePlayerJoinRoom(
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
  });

  // await socket.join(room.gameId);
  server.to(roomId).emit("server.room.join", room);
  server.to(roomId).emit("room.bus", "user joined room.");
  server.to(roomId).emit("room.update", room);

  await new Promise((resolve) => setTimeout(resolve, 3000));

  if (room.players.length >= 2 && room.state === RoomState.LOBBY) {
    room.state = RoomState.STARTING;
    server.to(roomId).emit("room.update", { state: room.state });

    await new Promise((resolve) => setTimeout(resolve, 3000));

    // start game countdown
    setTimeout(() => {
      server.to(roomId).emit("room.countdown", 3);
      server.to(roomId).emit("room.bus", "3...");
    }, 1000);

    setTimeout(() => {
      server.to(roomId).emit("room.countdown", 2);
      server.to(roomId).emit("room.bus", "2...");
    }, 2000);

    setTimeout(() => {
      server.to(roomId).emit("room.countdown", 1);
      server.to(roomId).emit("room.bus", "1...");
    }, 3000);

    // artificial wait for the countdown and start the game
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
}

export { handlePlayerJoinRoom };
