import express from "express";
import http from "http";
import { Server } from "socket.io";
import { GameRoom } from "./game.js";
import { CreateRoomPayload, GameRoomState, InputPayload, RoomJoinPayload } from "./types.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const PORT = Number(process.env.PORT ?? 3001);
const rooms = new Map<string, GameRoom>();

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    rooms: rooms.size,
    timestamp: new Date().toISOString(),
  });
});

function emitRoomState(room: GameRoom): void {
  io.to(room.roomId).emit("room:state", room.state as GameRoomState);
}

io.on("connection", (socket) => {
  socket.emit("server:welcome", {
    message: "Connected to ft_transcendence multiplayer server",
    socketId: socket.id,
  });

  socket.on("room:create", (payload: CreateRoomPayload) => {
    const roomId = `room-${Math.random().toString(36).slice(2, 8)}`;
    const room = new GameRoom(roomId);
    const player = room.addPlayer(socket.id, payload.playerName ?? "Player");

    rooms.set(roomId, room);
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.emit("room:joined", { roomId, player });
    emitRoomState(room);
  });

  socket.on("room:join", (payload: RoomJoinPayload) => {
    const roomId = payload.roomId ?? "";
    const room = rooms.get(roomId);

    if (!room) {
      socket.emit("room:error", { message: "Room not found" });
      return;
    }

    if (Object.keys(room.state.players).length >= 4) {
      socket.emit("room:error", { message: "Room is full" });
      return;
    }

    const playerName = payload.playerName ?? `Player-${Math.random().toString(36).slice(2, 5)}`;
    const player = room.addPlayer(socket.id, playerName);

    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.emit("room:joined", { roomId, player });
    emitRoomState(room);
  });

  socket.on("room:start", (roomId: string) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit("room:error", { message: "Room not found" });
      return;
    }

    room.start();
    emitRoomState(room);
  });

  socket.on("player:input", (payload: InputPayload) => {
    const room = rooms.get(payload.roomId);
    if (!room) return;

    room.updateInput(socket.id, payload.input);
    emitRoomState(room);
  });

  socket.on("disconnect", () => {
    const roomId = socket.data.roomId as string | undefined;
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    room.removePlayer(socket.id);
    emitRoomState(room);

    if (Object.keys(room.state.players).length === 0) {
      rooms.delete(roomId);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Game server listening on port ${PORT}`);
});
