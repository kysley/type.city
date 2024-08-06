import { Server } from "socket.io";
import { getWords, Seed } from "wordkit";
import { RoomState } from "./multiplayer.types";
import { timerManager } from "./persisted-timeout";

const seed = new Seed({ seed: process.env.LOCALDEVSEED });
export const roomLookup: Record<
  string,
  { gameId: string; players: any[]; words: string[]; state: RoomState }
> = {
  localdev: {
    words: getWords(250, seed).split(","),
    gameId: "localdev",
    players: [],
    state: RoomState.WAITING,
  },
};

async function handlePlayerJoinRoom(
  roomId: string,
  playerId: string,
  server: Server
) {
  const room = roomLookup[roomId];

  if (!room) {
    throw `[handlePlayerJoinRoom]: room with id ${roomId} does not exist`;
  }

  room.players.push({
    id: playerId,
    apm: 0,
    letterindex: 0,
    wordIndex: 0,
  });

  // await socket.join(room.gameId);
  server.to(roomId).emit("server.room.join", room);
  server.to(roomId).emit("room.bus", "user joined room.");
  server.to(roomId).emit("room.update", room);

  await new Promise((resolve) => setTimeout(resolve, 3000));

  if (room.players.length === 2 && room.state === RoomState.WAITING) {
    server.to(roomId).emit("room.update", { state: RoomState.STARTING });
    room.state = RoomState.STARTING;

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
    room.state = RoomState.STARTED;
    server.to(roomId).emit("room.update", { state: RoomState.STARTED });

    timerManager.setPersistedTimeout(
      roomId,
      () => {
        console.info(`[${roomId}]: GAME ENDING.`);
        room.state = RoomState.OVER;
        server.to(roomId).emit("room.update", { state: RoomState.OVER });
      },
      30 * 1000
    );

    // Manually restart the game for now
    timerManager.setPersistedTimeout(
      roomId,
      () => {
        console.info(`[${roomId}]: GAME RESTARTING.`);
        room.state = RoomState.WAITING;
        server.to(roomId).emit("room.update", { state: RoomState.WAITING });
      },
      45 * 1000
    );
  }
}

export { handlePlayerJoinRoom };
