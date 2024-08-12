import { Prisma, PrismaClient } from "@prisma/client";
import fastify from "fastify";
import fastifyIO from "fastify-socket.io";
import { Server } from "socket.io";
import cors from "@fastify/cors";
import {
  handlePlayerRoomJoin,
  handlePlayerRoomReady,
  Room,
  roomLookup,
  RoomPlayer,
} from "./multiplayer/rooms";
import { randomUUID } from "crypto";
import { RoomState } from "./multiplayer/multiplayer.types";
import { getWords } from "wordkit";

// Declare module augmentation for fastify
declare module "fastify" {
  interface FastifyInstance {
    io: Server;
  }
}

const prisma = new PrismaClient();
const app = fastify({
  logger: false,
  // @ts-expect-error stupid
  rewriteUrl: (req) => {
    if (req.url?.startsWith("/type")) {
      return req.url.replace("/type", "");
    }
    return req.url;
  },
});

app.register(cors, {
  credentials: true,
  origin: ["http://localhost:5173", "https://type.e8y.fun"],
});

app.register(fastifyIO, {
  // I think this is needed to avoid namespace collision
  path: "/type/s",
  cors: {
    origin: ["http://localhost:5173", "https://type.e8y.fun"],
    credentials: true,
  },
});

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  return users;
});

app.ready().then(() => {
  app.io.on("connection", (socket) => {
    let sGameId: string | undefined;

    socket.emit("ack", "Hello from server");

    socket.on("disconnect", (reason) => {
      if (sGameId) {
        const room = roomLookup[sGameId];

        if (room) {
          console.log("cleaning up user disconnect");
          room.players = room.players.filter(
            (player) => player.id !== socket.id
          );
          socket.to(sGameId).emit("room.update", room);
          socket.to(sGameId).emit("room.bus", "user left room.");
          // I assume this is automatic
          // socket.leave(sGameId);
        }
      }
    });

    socket.on("client.update", (playerState) => {
      if (!sGameId) return;

      const room = roomLookup[sGameId];

      if (!room) return;

      const newPlayers = room.players.map((player) => {
        if (player.id === socket.id) {
          return { ...player, ...playerState };
        }

        return player;
      });

      console.log("got player update", playerState);

      room.players = newPlayers;

      socket.to(sGameId).emit("room.update", room);
    });

    socket.on("client.room.create", async (player) => {
      if (sGameId) return;

      const roomId = randomUUID();
      const room: Room = {
        gameId: roomId,
        players: [],
        state: RoomState.LOBBY,
        words: getWords(250).split(","),
      };
      // don't worry about colissions for now
      roomLookup[roomId] = room;

      console.log(socket.id, "user created room", roomId, player);
      try {
        /*  socket.join(roomId);
        await handlePlayerRoomJoin(
          room.gameId,
          {
            cursorId: 0,
            userbarId: 0,
            ...player,
            apm: 0,
            letterIndex: 0,
            wordIndex: 0,
            isReady: false,
            id: socket.id,
          },
          app.io
        ); */
        // let the user join/connect the socket server for the newly created room through their own means
        socket.emit("server.room.created", room.gameId);
      } catch (e) {
        console.error(e);
      }
    });

    socket.on(
      "client.room.join",
      async (gameId: string, player: Partial<RoomPlayer>) => {
        // battle the useeffects in dev ig...
        if (sGameId === gameId) return;
        const room = roomLookup[gameId];
        if (!room) {
          return;
        }
        sGameId = room.gameId;
        console.log(socket.id, "user joining", gameId, player);
        try {
          socket.join(sGameId);
          await handlePlayerRoomJoin(
            room.gameId,
            { ...player, id: socket.id },
            app.io
          );
        } catch (e) {
          console.error(e);
        }
      }
    );

    socket.on("client.room.ready", async () => {
      // we should probably let the player know that something didn't work throughout this
      if (!sGameId) return;
      const room = roomLookup[sGameId];

      if (!room) return;

      console.log(socket.id, "user ready");

      try {
        await handlePlayerRoomReady(room.gameId, socket.id, app.io);
      } catch (e) {
        console.error(e);
      }
    });
  });
});

app.listen({ port: 8013, host: "0.0.0.0" }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`
  🚀 Server ready at: http://localhost:3000
  ⭐️ See sample requests: http://pris.ly/e/ts/rest-fastify#3-using-the-rest-api`);
});
