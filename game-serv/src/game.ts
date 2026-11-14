import { GameRoomState, PlayerInput, PlayerState } from "./types.js";

const ROOM_WIDTH = 800;
const ROOM_HEIGHT = 480;
const PLAYER_WIDTH = 24;
const PLAYER_HEIGHT = 24;
const PLAYER_SPEED = 5;
const MAX_SCORE = 5;
const COLORS = ["#FF6B6B", "#4ECDC4", "#FFD93D", "#6C63FF"];

export class GameRoom {
  public readonly roomId: string;
  public readonly state: GameRoomState;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(roomId: string) {
    this.roomId = roomId;
    this.state = {
      roomId,
      phase: "waiting",
      players: {},
      width: ROOM_WIDTH,
      height: ROOM_HEIGHT,
      winnerId: null,
      timeLeft: 60,
    };
  }

  addPlayer(playerId: string, name: string): PlayerState {
    const color = COLORS[Object.keys(this.state.players).length % COLORS.length];
    const player: PlayerState = {
      id: playerId,
      name,
      x: 80 + Object.keys(this.state.players).length * 140,
      y: ROOM_HEIGHT / 2 - PLAYER_HEIGHT / 2,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      color,
      score: 0,
      input: { left: false, right: false, up: false, down: false },
    };

    this.state.players[playerId] = player;
    return player;
  }

  removePlayer(playerId: string): void {
    delete this.state.players[playerId];

    if (Object.keys(this.state.players).length === 0) {
      this.stop();
    }
  }

  updateInput(playerId: string, input: PlayerInput): void {
    if (!this.state.players[playerId]) return;
    this.state.players[playerId].input = input;
  }

  start(): void {
    if (this.state.phase === "playing") return;

    this.state.phase = "playing";
    this.state.timeLeft = 60;
    this.state.winnerId = null;

    this.updateInterval = setInterval(() => {
      this.tick();
    }, 1000 / 60);
  }

  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    this.state.phase = "waiting";
    this.state.timeLeft = 60;
    this.state.winnerId = null;
  }

  private tick(): void {
    if (this.state.phase !== "playing") return;

    const players: PlayerState[] = Object.values(this.state.players) as PlayerState[];

    for (const player of players) {
      const input = player.input;
      let deltaX = 0;
      let deltaY = 0;

      if (input.left) deltaX -= PLAYER_SPEED;
      if (input.right) deltaX += PLAYER_SPEED;
      if (input.up) deltaY -= PLAYER_SPEED;
      if (input.down) deltaY += PLAYER_SPEED;

      player.x = Math.max(0, Math.min(this.state.width - player.width, player.x + deltaX));
      player.y = Math.max(0, Math.min(this.state.height - player.height, player.y + deltaY));
    }

    this.state.timeLeft = Math.max(0, this.state.timeLeft - 1 / 60);

    for (const player of players) {
      if (player.score >= MAX_SCORE) {
        this.state.phase = "finished";
        this.state.winnerId = player.id;
        this.stop();
        return;
      }
    }

    if (this.state.timeLeft <= 0) {
      const sorted: PlayerState[] = [...players].sort((a: PlayerState, b: PlayerState) => b.score - a.score);
      this.state.phase = "finished";
      this.state.winnerId = sorted[0]?.id ?? null;
      this.stop();
    }
  }
}
