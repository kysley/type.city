import dotenv from "dotenv";
dotenv.config();
import { PrismaClient, User } from "@prisma/client";
import fastify from "fastify";
import fastifyIO from "fastify-socket.io";
import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
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
import { discord } from "./utils/discord-oauth";
import {
  ResultResponse,
  ResultSubmission,
  WordFinishState,
  xpSystem,
} from "types";

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

// Register plugins
app.register(fastifyJwt, {
  secret: "your-secret-key", // Replace with a secure secret key
  cookie: {
    cookieName: "token",
    signed: false,
  },
});

app.register(fastifyCookie, {
  secret: "your-cookie-secret", // Cookie signing secret
  parseOptions: {}, // options for parsing cookies
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

app.get("/me", async (req, res) => {
  console.log({ reqUser: req.user, cookie: req.cookies });
  await req.jwtVerify({ onlyCookie: true });
  console.log({ reqUser: req.user });

  const user = prisma.user.findUnique({
    where: {
      id: req.user.userId,
    },
  });

  // const users = await prisma.user.findMany();
  return user;
});

app.post("/submit", async (req, res): Promise<ResultResponse> => {
  await req.jwtVerify({ onlyCookie: true });

  const submission = req.body as ResultSubmission;

  const wordCounts = submission.state.reduce<Record<WordFinishState, number>>(
    (acc, cur) => {
      acc[cur.finishState] += 1;
      return acc;
    },
    {
      [WordFinishState.CORRECT]: 0,
      [WordFinishState.INCORRECT]: 0,
      [WordFinishState.FLAWLESS]: 0,
      [WordFinishState.UNFINISHED]: 0,
    }
  );

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: req.user.userId,
    },
  });

  const sessionXP = xpSystem.calculateSessionXP(wordCounts);
  const newProgress = xpSystem.addXP(
    { level: user.level, xp: user.xp },
    sessionXP
  );

  console.log({ sessionXP, newProgress });

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      level: newProgress.level,
      xp: newProgress.xp,
      results: {
        create: {
          accuracy: submission.accuracy,
          condition: submission.condition,
          mode: submission.mode,
          wordIndex: submission.wordIndex,
          wpm: submission.wpm,
        },
      },
    },
  });

  return {
    valid: true,
    level: updatedUser.level,
    levelup: user.level !== newProgress.level,
    gainxp: sessionXP,
  };
});

app.get("/temp", async (req, res) => {
  const admin = await prisma.user.findUnique({
    where: {
      id: "-1",
    },
  });

  if (!admin) throw "no admin account";

  const token = app.jwt.sign({ userId: admin.id });

  res.setCookie("token", token, {
    httpOnly: true,
    // secure: process.env.NODE_ENV !== "development",
    secure: false,
    sameSite: "strict",
    path: "/",
  });
});

app.post("/register/discord", async (req, res) => {
  const { code } = req.body as { code?: string };

  // console.log(req);

  try {
    await req.jwtVerify({ onlyCookie: true });
    const user = prisma.user.findUniqueOrThrow({
      where: {
        id: req.user.userId,
      },
    });
    console.log("registering user with valid cookie");
    return user;
  } catch (e) {
    console.log("cookie user not found");
    // res.clearCookie("token");
  }

  if (!code) {
    res.status(400);
    return;
  }

  try {
    const handshake = await discord.exchangeCode(code);
    const discordUser = await discord.me(handshake.access_token);

    let user: User | null;

    // Try to find an existing user for the oauth request
    user = await prisma.user.findUnique({
      where: {
        name: discordUser.username,
      },
    });

    // otherwise create a new user
    if (!user) {
      console.log("oauth user not found, creating new");
      user = await prisma.user.create({
        data: {
          name: discordUser.username,
          discord: {
            create: {
              access_token: handshake.access_token,
              expires_in: handshake.expires_in,
              refresh_token: handshake.refresh_token,
              scope: handshake.scope,
            },
          },
        },
      });
    } else {
      console.log("existing oauth user found");
    }

    console.log("signing cookie");
    const token = app.jwt.sign({ userId: user.id });

    res.setCookie("token", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV !== "development",
      secure: false,
      sameSite: "strict",
      path: "/",
    });

    return user;
  } catch (e) {
    console.log(e);
    res.status(500);
    return;
  }
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

      // Don't listen to client updates if game is not in progress
      if (!room || room.state !== RoomState.IN_PROGRESS) return;

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
  🚀 Server ready at: http://localhost:8013
  ⭐️ See sample requests: http://pris.ly/e/ts/rest-fastify#3-using-the-rest-api`);
});
