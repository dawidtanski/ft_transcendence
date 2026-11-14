"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

type PlayerState = {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  score: number;
};

type GameRoomState = {
  roomId: string;
  phase: "waiting" | "playing" | "finished";
  players: Record<string, PlayerState>;
  width: number;
  height: number;
  winnerId: string | null;
  timeLeft: number;
};

const serverUrl = process.env.NEXT_PUBLIC_GAME_SERVER_URL ?? "http://localhost:3001";

export default function Game() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("Connecting to game server...");
  const [playerName, setPlayerName] = useState("Player");
  const [roomIdInput, setRoomIdInput] = useState("");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomState, setRoomState] = useState<GameRoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const keyState = useRef({ left: false, right: false, up: false, down: false });

  useEffect(() => {
    const client = io(serverUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    client.on("connect", () => {
      setConnected(true);
      setStatus("Connected to multiplayer server");
      setError(null);
    });

    client.on("disconnect", () => {
      setConnected(false);
      setStatus("Disconnected from multiplayer server");
    });

    client.on("server:welcome", (payload: { message: string }) => {
      setStatus(payload.message);
    });

    client.on("room:joined", ({ roomId: nextRoomId }: { roomId: string }) => {
      setRoomId(nextRoomId);
      setStatus(`Joined room ${nextRoomId}`);
    });

    client.on("room:error", ({ message }: { message: string }) => {
      setError(message);
    });

    client.on("room:state", (state: GameRoomState) => {
      setRoomState(state);
    });

    setSocket(client);

    return () => {
      client.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!roomId || !connected || !socket) {
      return;
    }

    const tick = () => {
      socket.emit("player:input", {
        roomId,
        input: keyState.current,
      });
    };

    const interval = window.setInterval(tick, 50);
    return () => window.clearInterval(interval);
  }, [roomId, connected, socket]);

  useEffect(() => {
    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === "arrowleft" || key === "a") keyState.current.left = false;
      if (key === "arrowright" || key === "d") keyState.current.right = false;
      if (key === "arrowup" || key === "w") keyState.current.up = false;
      if (key === "arrowdown" || key === "s") keyState.current.down = false;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === "arrowleft" || key === "a") keyState.current.left = true;
      if (key === "arrowright" || key === "d") keyState.current.right = true;
      if (key === "arrowup" || key === "w") keyState.current.up = true;
      if (key === "arrowdown" || key === "s") keyState.current.down = true;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const players = useMemo(() => {
    if (!roomState) return [];
    return Object.values(roomState.players);
  }, [roomState]);

  const createRoom = () => {
    if (!socket) return;
    socket.emit("room:create", { playerName });
    setError(null);
  };

  const joinRoom = () => {
    if (!socket) return;
    socket.emit("room:join", {
      roomId: roomIdInput.trim(),
      playerName,
    });
    setError(null);
  };

  const startGame = () => {
    if (!socket || !roomId) return;
    socket.emit("room:start", roomId);
  };

  return (
    <div className="grid grid-cols-1 flex-1 min-h-0 lg:grid-cols-5 lg:h-screen w-full text-white">
      <aside className="hidden lg:block lg:col-span-1 bg-gray-800 p-4 border-r border-gray-700 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">🔥 Multiplayer</h2>
        <div className="space-y-3">
          <input
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value || "Player")}
            className="w-full rounded border border-gray-600 bg-gray-900 px-3 py-2 text-sm"
            placeholder="Player name"
          />
          <button
            onClick={createRoom}
            className="w-full rounded bg-purple-600 px-3 py-2 text-sm font-semibold hover:bg-purple-500"
          >
            Create room
          </button>
          <div className="flex gap-2">
            <input
              value={roomIdInput}
              onChange={(event) => setRoomIdInput(event.target.value)}
              className="w-full rounded border border-gray-600 bg-gray-900 px-3 py-2 text-sm"
              placeholder="Room ID"
            />
            <button
              onClick={joinRoom}
              className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold hover:bg-blue-500"
            >
              Join
            </button>
          </div>
          <button
            onClick={startGame}
            disabled={!roomId}
            className="w-full rounded border border-green-500 px-3 py-2 text-sm font-semibold text-green-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start match
          </button>
          <div className="rounded border border-gray-700 bg-gray-900 p-3 text-xs text-gray-300">
            <div className="font-semibold text-white">Status</div>
            <div className="mt-1">{connected ? "Online" : "Offline"}</div>
            <div className="mt-1">{status}</div>
            {roomId && <div className="mt-1">Room: {roomId}</div>}
          </div>
          {error && <div className="rounded border border-red-500 bg-red-500/10 p-3 text-xs text-red-300">{error}</div>}
        </div>
      </aside>

      <main className="min-h-0 lg:col-span-3 flex flex-col items-center justify-center p-6 bg-gray-950">
        <div className="w-full max-w-4xl overflow-hidden rounded-lg border border-purple-500 bg-black shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-800 bg-gray-950 px-4 py-3 text-sm text-gray-300">
            <span>Game arena</span>
            <span>
              {roomState ? `${roomState.phase.toUpperCase()} • ${roomState.timeLeft.toFixed(0)}s` : "WAITING"}
            </span>
          </div>

          <div className="relative h-[420px] w-full bg-[radial-gradient(circle_at_center,_#111827_0%,_#030712_60%,_#020617_100%)]">
            {roomState ? (
              <>
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="absolute rounded-sm border-2 border-white/80 shadow-lg"
                    style={{
                      left: `${(player.x / roomState.width) * 100}%`,
                      top: `${(player.y / roomState.height) * 100}%`,
                      width: `${(player.width / roomState.width) * 100}%`,
                      height: `${(player.height / roomState.height) * 100}%`,
                      backgroundColor: player.color,
                    }}
                    title={`${player.name}: ${player.score}`}
                  />
                ))}
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-lg text-gray-400">Create or join a room to start playing.</div>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-300">
          <span className="rounded border border-gray-700 bg-gray-900 px-3 py-1">Use WASD or arrow keys</span>
          <span className="rounded border border-gray-700 bg-gray-900 px-3 py-1">Server: {serverUrl}</span>
        </div>
      </main>

      <aside className="hidden lg:flex lg:col-span-1 bg-gray-800 p-4 border-l border-gray-700 flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-4">📊 Players</h2>
          <div className="space-y-3">
            {players.length > 0 ? (
              players.map((player) => (
                <div key={player.id} className="flex items-center justify-between rounded border border-gray-700 bg-gray-900 p-2">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: player.color }} />
                    <span>{player.name}</span>
                  </div>
                  <span>{player.score}</span>
                </div>
              ))
            ) : (
              <div className="rounded border border-dashed border-gray-700 p-3 text-sm text-gray-400">No players yet.</div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}