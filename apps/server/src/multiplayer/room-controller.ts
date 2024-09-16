import { randomUUID } from "crypto";
import {
  GameMode,
  Room,
  RoomPlayerState,
  RoomRelayMeta,
  RoomState,
  ServerEvents,
} from "types";
import { getWords } from "wordkit";
import { Server } from "socket.io";
import { wait } from "../utils";
import { timerManager } from "./persisted-timeout";

class RoomController implements Room {
  mode: GameMode;
  condition: number;
  players: RoomPlayerState[];
  state: RoomState;
  gameId: string;
  meta?: unknown;
  words: string[];

  server: Server;

  constructor(room: Partial<Room> & { server: Server }) {
    this.gameId = room.gameId || randomUUID().toString();
    this.mode = room.mode ?? GameMode.LIMIT;
    this.condition = room.condition ?? 30;
    this.state = room.state ?? RoomState.LOBBY;
    this.players = room.players || [];

    this.meta = room.meta;

    // After assigning the meta, if we are constructing a Relay room set the leg to 1
    if (this.mode === GameMode.RELAY) {
      this.meta = {
        ...(this.meta as object),
        leg: 1,
      };
    }

    const generateManyWords = room.mode === GameMode.LIMIT;

    // If the test is a Race, generate the number of words based off the condition
    // otherwise, 250 is a lot for the time being
    const numWordsToGenerate = generateManyWords ? 250 : this.condition;

    this.words = room.words || getWords(numWordsToGenerate).split(",");
    this.server = room.server;
  }

  onPlayerJoin(player: Partial<RoomPlayerState>) {
    const pIdx = this.players.findIndex((p) => p.id === player.id);
    if (pIdx !== -1) return;

    this.players.push({
      ...player,
      id: player.id || randomUUID(),
      apm: 0,
      letterIndex: 0,
      wordIndex: 0,
      isReady: false,
    });

    this.emit(ServerEvents.ROOM_JOIN, this.room);
    this.emit(ServerEvents.ROOM_BUS, "user joined room.");
    // this.emit(ServerEvents.ROOM_UPDATE, this.room);

    if (this.players.length >= 2 && this.state === RoomState.LOBBY) {
      this.triggerCountdown();
    }
  }

  onPlayerReady(playerId: string) {
    const pIdx = this.players.findIndex((p) => p.id === playerId);

    if (pIdx === -1) return;

    this.players[pIdx].isReady = true;

    this.server.emit(ServerEvents.ROOM_UPDATE, { players: this.players });

    switch (this.mode) {
      case GameMode.RELAY: {
        if (this.readyPlayerCount === this.players.length) {
          this.resetPlayers();
          this.startNextLeg();
        }
        break;
      }
      default: {
        if (this.readyPlayerCount >= 2) {
          this.words = getWords(this.numWordsToGenerate).split(",");
          this.resetPlayers();
          this.triggerCountdown();
        }
      }
    }
  }

  startNextLeg() {
    const { legs, leg, legWords } = this.meta as RoomRelayMeta;

    if (leg && leg + 1 <= legs) {
      console.log("STARTING NEXT LEG");

      this.meta.leg += 1;

      if (legWords?.[leg]) {
        this.words = legWords;
      } else {
        this.words = getWords(this.numWordsToGenerate).split(",");
      }
      this.emit(ServerEvents.ROOM_UPDATE, {
        meta: this.meta,
        words: this.words,
      });
      this.triggerCountdown();
      // If the "next leg" is greater than the number of legs, end the game
    } else if (this.meta && leg + 1 > legs) {
      console.log("LAST LEG COMPLETED");
      this.endGame();
    } else {
      console.log("something unexpected", { ...(this.meta as object) });
    }
  }

  onPlayerUpdate(playerId: string, player: Partial<RoomPlayerState>) {
    if (this.state !== RoomState.IN_PROGRESS) {
      console.log("GOT UPDATE WHILE ROOM ISN'T ACCEPTING");
      return;
    }

    const pIdx = this.players.findIndex((p) => p.id === playerId);

    if (pIdx === -1) {
      console.log("player not found?");
      return;
    }

    const p = this.players[pIdx];

    this.players[pIdx] = { ...p, ...player };

    this.emit(ServerEvents.ROOM_UPDATE, { players: this.players });

    switch (this.mode) {
      case GameMode.RELAY:
      case GameMode.RACE: {
        if (player.wordIndex === this.room.condition) {
          console.log("RACE END OR RELAY LEG END");
          console.log(`Room ${this.gameId} ending. Player finished final word`);
          this.endGame();
        }
        break;
      }
      default: {
        break;
      }
    }
  }

  resetPlayers() {
    this.players = this.players.map((p) => ({
      ...p,
      apm: 0,
      letterIndex: 0,
      wordIndex: 0,
      isReady: false,
    }));

    this.emit(ServerEvents.ROOM_UPDATE, { players: this.players });
  }

  emit(event: ServerEvents, data: Partial<Room> | number | string) {
    this.server.to(this.gameId).emit(event, data);
  }

  async triggerCountdown() {
    this.state = RoomState.STARTING;
    this.emit(ServerEvents.ROOM_UPDATE, { state: this.state });

    // await new Promise((resolve) => setTimeout(resolve, 3000));
    await wait(3000);

    this.emit(ServerEvents.ROOM_COUNTDOWN, 3);
    this.emit(ServerEvents.ROOM_BUS, "3...");

    await wait(1000);

    this.emit(ServerEvents.ROOM_COUNTDOWN, 2);
    this.emit(ServerEvents.ROOM_BUS, "2...");

    await wait(1000);

    this.emit(ServerEvents.ROOM_COUNTDOWN, 1);
    this.emit(ServerEvents.ROOM_BUS, "1...");

    await wait(1000);

    // emitting a bunch here right after one another... await?

    this.emit(ServerEvents.ROOM_COUNTDOWN, 0);
    this.emit(ServerEvents.ROOM_BUS, "Go!");

    this.state = RoomState.IN_PROGRESS;

    this.emit(ServerEvents.ROOM_UPDATE, { state: this.state });

    if (this.mode === GameMode.LIMIT) {
      console.log("Setting game end timer!");
      timerManager.setPersistedTimeout(
        this.gameId,
        () => {
          this.endGame();
        },
        this.condition * 1000
      );
    }
  }

  onPlayerLeave(playerId: string) {
    this.players = this.players.filter((p) => p.id !== playerId);
    this.emit(ServerEvents.ROOM_BUS, "user left room.");
    this.emit(ServerEvents.ROOM_UPDATE, { players: this.players });
  }

  endGame() {
    this.state = RoomState.GAME_OVER;
    this.emit(ServerEvents.ROOM_UPDATE, { state: this.state });
  }

  get readyPlayerCount() {
    return this.players.filter((player) => player.isReady).length;
  }

  get numWordsToGenerate() {
    const generateManyWords = this.mode === GameMode.LIMIT;

    // If the test is a Race, generate the number of words based off the condition
    // otherwise, 250 is a lot for the time being
    return generateManyWords ? 250 : this.condition;
  }

  get room(): Room {
    return {
      condition: this.condition,
      gameId: this.gameId,
      mode: this.mode,
      players: this.players,
      state: this.state,
      words: this.words,
      meta: this.meta,
    };
  }
}

export { RoomController };
