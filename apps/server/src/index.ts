import { Prisma, PrismaClient } from "@prisma/client";
import fastify from "fastify";
import fastifyIO from "fastify-socket.io";
import { Server } from "socket.io";
import cors from "@fastify/cors";
import {
  handlePlayerRoomJoin,
  handlePlayerRoomReady,
  roomLookup,
  RoomPlayer,
} from "./multiplayer/rooms";

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

app.post<{
  Body: ISignupBody;
}>("/signup", async (req, res) => {
  const { name, email, posts } = req.body;

  const postData = posts?.map((post: Prisma.PostCreateInput) => {
    return { title: post?.title, content: post?.content };
  });

  const result = await prisma.user.create({
    data: {
      name,
      email,
      posts: {
        create: postData,
      },
    },
  });
  return result;
});

app.post<{
  Body: ICreatePostBody;
}>(`/post`, async (req, res) => {
  const { title, content, authorEmail } = req.body;
  const result = await prisma.post.create({
    data: {
      title,
      content,
      author: { connect: { email: authorEmail } },
    },
  });
  return result;
});

app.put<{
  Params: IPostByIdParam;
}>("/post/:id/views", async (req, res) => {
  const { id } = req.params;

  try {
    const post = await prisma.post.update({
      where: { id: Number(id) },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    return post;
  } catch (error) {
    return { error: `Post with ID ${id} does not exist in the database` };
  }
});

app.put<{
  Params: IPostByIdParam;
}>("/publish/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const postData = await prisma.post.findUnique({
      where: { id: Number(id) },
      select: {
        published: true,
      },
    });

    const updatedPost = await prisma.post.update({
      where: { id: Number(id) || undefined },
      data: { published: !postData?.published },
    });
    return updatedPost;
  } catch (error) {
    return { error: `Post with ID ${id} does not exist in the database` };
  }
});

app.delete<{
  Params: IPostByIdParam;
}>(`/post/:id`, async (req, res) => {
  const { id } = req.params;
  const post = await prisma.post.delete({
    where: {
      id: Number(id),
    },
  });
  return post;
});

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  return users;
});

app.get<{
  Params: IPostByIdParam;
}>("/user/:id/drafts", async (req, res) => {
  const { id } = req.params;

  const drafts = await prisma.user
    .findUnique({
      where: { id: Number(id) },
    })
    .posts({
      where: { published: false },
    });

  return drafts;
});

app.get<{
  Params: IPostByIdParam;
}>(`/post/:id`, async (req, res) => {
  const { id } = req.params;

  const post = await prisma.post.findUnique({
    where: { id: Number(id) },
  });
  return post;
});

app.get<{
  Querystring: IFeedQueryString;
}>("/feed", async (req, res) => {
  const { searchString, skip, take, orderBy } = req?.query;

  const or: Prisma.PostWhereInput = searchString
    ? {
        OR: [
          { title: { contains: searchString as string } },
          { content: { contains: searchString as string } },
        ],
      }
    : {};

  const posts = await prisma.post.findMany({
    where: {
      published: true,
      ...or,
    },
    include: { author: true },
    take: Number(take) || undefined,
    skip: Number(skip) || undefined,
    orderBy: {
      updatedAt: orderBy as Prisma.SortOrder,
    },
  });

  return posts;
});
interface IFeedQueryString {
  searchString: string | null;
  skip: number | null;
  take: number | null;
  orderBy: Prisma.SortOrder | null;
}

interface IPostByIdParam {
  id: number;
}

interface ICreatePostBody {
  title: string;
  content: string | null;
  authorEmail: string;
}

interface ISignupBody {
  name: string | null;
  email: string;
  posts: Prisma.PostCreateInput[];
}

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
