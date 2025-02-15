import dotenv from "dotenv";
dotenv.config();
import type { Daily, User } from "@prisma/client";
import fastify from "fastify";
import fastifyIO from "fastify-socket.io";
import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
import type { Server } from "socket.io";
import cors from "@fastify/cors";
import { randomUUID } from "node:crypto";
import { getWords, Seed } from "@wwwares/seed-kit";
import { discord } from "./utils/discord-oauth";
import {
	ClientEvents,
	GameMode,
	getWordGenCount,
	levelSystem,
	type ResultResponse,
	type ResultSubmission,
	type Room,
	type RoomPlayerState,
	RoomState,
	ServerEvents,
	validateResults,
	WordFinishState,
} from "types";
import { RoomController } from "./multiplayer/room-controller";
import { createDailyTest } from "./utils";
import { DailyLeaderboard } from "./jobs";
import { leaderboard } from "./utils/leaderboard";
import {
	achievementService,
	type AchievementUpdate,
} from "./utils/achievements/achievement-system";
import { AchievementType } from "./utils/achievements";
import { prisma } from "./utils/prisma";

export const roomLookup: Record<string, RoomController> = {};

// Declare module augmentation for fastify
declare module "fastify" {
	interface FastifyInstance {
		io: Server;
	}
}

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
	secret: process.env.JWTS || "", // Replace with a secure secret key
	cookie: {
		cookieName: "token",
		signed: false,
	},
});

app.register(fastifyCookie, {
	secret: process.env.CS || "", // Cookie signing secret
	parseOptions: {}, // options for parsing cookies
});

app.register(cors, {
	credentials: true,
	origin: ["http://localhost:5173", "https://type.city"],
});

app.register(fastifyIO, {
	// I think this is needed to avoid namespace collision
	path: "/type/s",
	cors: {
		origin: ["http://localhost:5173", "https://type.city"],
		credentials: true,
	},
});

app.get("/me", async (req, res) => {
	try {
		await req.jwtVerify({ onlyCookie: true });
	} catch (e) {
		res.clearCookie("token", {
			domain: process.env.REDIRECT_URI?.includes("https")
				? "api.e8y.fun"
				: undefined,
		});
		throw e;
	}

	const user = prisma.user.findUnique({
		where: {
			id: req.user.userId,
		},
	});

	return user;
});

app.post(
	"/submit",
	async (
		req,
		res,
	): Promise<ResultResponse & { achievementUpdate?: AchievementUpdate[] }> => {
		await req.jwtVerify({ onlyCookie: true });

		const submission = req.body.result as ResultSubmission;
		const resultMode = req.body.mode as "daily" | undefined;

		const serverPhrase = `${submission.mode},${submission.condition},${submission.startTime}`;
		const serverSeed = new Seed({ seed: serverPhrase });
		const { valid, reason } = validateResults(
			submission,
			serverSeed.state.seed,
		);

		if (reason) {
			throw `Submission is invalid. ${reason}`;
		}

		const user = await prisma.user.findUniqueOrThrow({
			where: {
				id: req.user.userId,
			},
		});

		let xpModifier = 1;

		if (submission.accuracy === 100 && submission.corrections === 0)
			xpModifier += 1;

		const xpGain = submission.state.reduce((gain, ws) => {
			if (!ws.backspaced) {
				// biome-ignore lint/style/noParameterAssign: its a reducer
				gain += 1;
			}

			switch (ws.finishState) {
				case WordFinishState.CORRECT: {
					// biome-ignore lint/style/noParameterAssign: its a reducer
					gain += 1;
					break;
				}
				case WordFinishState.FLAWLESS: {
					// biome-ignore lint/style/noParameterAssign: its a reducer
					gain += 2;
				}
			}

			return gain;
		}, 0);

		const xpEarned = xpModifier * xpGain;

		const levelProgress = levelSystem.getLevelInfo(user.xp + xpEarned);

		const updatedUser = await prisma.user.update({
			where: {
				id: user.id,
			},
			select: {
				name: true,
			},
			data: {
				xp: levelProgress.totalXP,
				results: {
					create: {
						accuracy: submission.accuracy,
						condition: submission.condition,
						mode: submission.mode,
						wordIndex: submission.wordIndex,
						wpm: submission.wpm,
						...(resultMode === "daily" &&
							{
								// daily
							}),
					},
				},
			},
		});

		const achievementType: AchievementType | undefined =
			submission.mode === GameMode.LIMIT
				? AchievementType.PLAY_LIMIT_GAMES
				: submission.mode === GameMode.RACE
					? AchievementType.PLAY_RACE_GAMES
					: undefined;

		let achievementUpdate: AchievementUpdate[] | undefined;
		if (achievementType) {
			achievementUpdate = await achievementService.updateAchievementProgress(
				user.id,
				achievementType,
				1,
			);
		}

		// if (wordCounts[WordFinishState.FLAWLESS] === submission.wordIndex) {
		// 	console.log("perfect submission!");
		// 	await achievementService.updateAchievementProgress(
		// 		user.id,
		// 		AchievementType.PERFECT_TESTS,
		// 		1,
		// 	);
		// }

		if (resultMode === "daily") {
			await achievementService.updateAchievementProgress(
				user.id,
				AchievementType.DAILY,
				1,
			);
			DailyLeaderboard.addScore(updatedUser.name, submission.wpm);
		}

		return {
			valid,
			levelInfo: levelProgress,
			achievementUpdate,
			xpGain: xpEarned,
			// Processed level vs initial user state level
			levelUp: levelProgress.level !== levelSystem.getLevelInfo(user.xp).level,
		};
	},
);

app.get("/daily", async () => {
	let daily: Daily;
	let words: string;
	try {
		daily = await prisma.daily.findFirstOrThrow({
			orderBy: {
				id: "desc",
			},
		});
		words = getWords(
			daily.condition === GameMode.LIMIT ? 300 : daily.condition,
			new Seed({ seed: daily.seed }),
		).words;
	} catch (e) {
		daily = await createDailyTest();
		words = getWords(
			daily.condition === GameMode.LIMIT ? 300 : daily.condition,
			new Seed({ seed: daily.seed }),
		).words;
	}
	return {
		...daily,
		seed: daily.seed,
	};
});

app.get("/daily/leaderboard", () => {
	return leaderboard.getLeaderboard();
});

// app.get("/temp", async (req, res) => {
// 	const admin = await prisma.user.findUnique({
// 		where: {
// 			id: "-1",
// 		},
// 	});

// 	if (!admin) throw "no admin account";

// 	const token = app.jwt.sign({ userId: admin.id });

// 	res.setCookie("token", token, {
// 		httpOnly: true,
// 		// secure: process.env.NODE_ENV !== "development",
// 		secure: false,
// 		sameSite: "strict",
// 		path: "/",
// 	});
// });

app.post("/register/discord", async (req, res) => {
	const { code } = req.body as { code?: string };

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
		res.clearCookie("token", {
			domain: process.env.REDIRECT_URI?.includes("https")
				? "api.e8y.fun"
				: undefined,
		});
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
			// on in prod
			secure: process.env.REDIRECT_URI?.includes("https"),
			// cross site cookies in prod because different domain
			sameSite: process.env.REDIRECT_URI?.includes("https") ? "none" : "strict",
			path: "/",
			// change on prod
			domain: process.env.REDIRECT_URI?.includes("https")
				? "api.e8y.fun"
				: undefined,
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
					room.onPlayerLeave(socket.id);
					socket.leave(sGameId);
				}
			}
		});

		socket.on(ClientEvents.UPDATE, async (playerState) => {
			if (!sGameId) return;

			const room = roomLookup[sGameId];

			room.onPlayerUpdate(socket.id, playerState);
		});

		socket.on(
			ClientEvents.ROOM_CREATE,
			async (settings: Partial<Pick<Room, "condition" | "mode" | "meta">>) => {
				const { condition = 30, mode = GameMode.LIMIT } = settings;
				if (sGameId) return;

				const numWords = getWordGenCount(mode, condition);

				const roomId = randomUUID();

				roomLookup[roomId] = new RoomController({
					gameId: roomId,
					players: [],
					state: RoomState.LOBBY,
					words: getWords(numWords).words.split(","),
					condition,
					mode,
					server: app.io,
					meta: settings.meta,
				});

				console.log(socket.id, "user created room", roomId);
				socket.emit(ServerEvents.ROOM_CREATED, roomId);
			},
		);

		socket.on(
			ClientEvents.ROOM_JOIN,
			async (gameId: string, player: Partial<RoomPlayerState>) => {
				// battle the useeffects in dev ig...
				if (sGameId === gameId) return;
				const room = roomLookup[gameId];
				if (!room) {
					return;
				}

				sGameId = gameId;

				console.log(socket.id, "user joining", gameId, player);
				socket.join(room.gameId);
				room.onPlayerJoin({ ...player, id: socket.id });
			},
		);

		socket.on(ClientEvents.READY, async () => {
			// we should probably let the player know that something didn't work throughout this
			if (!sGameId) return;
			const room = roomLookup[sGameId];
			if (!room) return;

			console.log(socket.id, "user ready");

			room.onPlayerReady(socket.id);
		});
	});
});

app.listen({ port: 8013, host: "0.0.0.0" }, (err) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log("[Creating localdev room]");
	roomLookup.localdev = new RoomController({
		words: getWords(300).words.split(","),
		gameId: "localdev",
		players: [],
		state: RoomState.LOBBY,
		mode: GameMode.LIMIT,
		condition: 60,
		server: app.io,
	});

	console.log(`
  🚀 Server ready at: http://localhost:8013
  ⭐️ See sample requests: http://pris.ly/e/ts/rest-fastify#3-using-the-rest-api`);
});
