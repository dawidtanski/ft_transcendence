export type PlayerInput = {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
};

export type PlayerState = {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  score: number;
  input: PlayerInput;
};

export type GameRoomState = {
  roomId: string;
  phase: "waiting" | "playing" | "finished";
  players: Record<string, PlayerState>;
  width: number;
  height: number;
  winnerId: string | null;
  timeLeft: number;
};

export type RoomJoinPayload = {
  roomId?: string;
  playerName?: string;
};

export type CreateRoomPayload = {
  playerName: string;
};

export type InputPayload = {
  roomId: string;
  input: PlayerInput;
};
