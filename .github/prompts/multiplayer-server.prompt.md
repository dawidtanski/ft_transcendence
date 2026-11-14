---
description: "Create a multiplayer server for the arcade game in this ft_transcendence project"
name: "Multiplayer game server"
argument-hint: "game name, number of players, gameplay mode, server port"
agent: "agent"
---

Create a multiplayer server for the browser game in this ft_transcendence repository.

Project context:
- This is a 42 final project: a browser-based arcade game.
- The frontend runs in Next.js and is started together with PostgreSQL using Docker Compose.
- The repository contains a separate `game-serv/` directory intended for the game server, but it has not yet been implemented.
- The main technologies used in the project are Node.js, TypeScript, Next.js, Docker, and PostgreSQL.
- The goal is to add real-time multiplayer, not just a simple frontend.

Task:
- design and build a multiplayer server in `game-serv/`
- provide support for lobby management, rooms, player joins, and game state synchronization
- implement game logic on the server side (authoritative server)
- prepare a simple WebSocket/Socket.IO event contract
- add basic support for match start, player movement, collisions, scoring, and game end
- account for disconnection scenarios, room reset, and input validation

Technical requirements:
1. Implement a working server in Node.js with TypeScript.
2. Use Socket.IO or WebSocket, choosing the best option for real-time online gameplay.
3. The server structure should be clear and modular, for example:
   - `game-serv/src/index.ts`
   - `game-serv/src/server.ts`
   - `game-serv/src/game.ts`
   - `game-serv/src/types.ts`
   - `game-serv/src/room.ts`
4. Enable room creation, joining an existing room, and automatic player matching.
5. The server should maintain the game state in real time and send full updates to clients.
6. Add a basic `health check` / server status endpoint.
7. Ensure compatibility with the Docker Compose project and add container startup configuration for the server.
8. Make sure the architecture is extensible and easy to expand further.
9. Include a description of the chosen architectural decisions and a short event documentation.
10. If needed, propose minimal changes in the Next.js frontend so the client can connect to the multiplayer server.

Valuable output:
- solid, working multiplayer server code
- clear file and logic organization
- description of client ↔ server communication
- list of events and example JSON contract
- local startup instructions and Docker configuration
- brief analysis of what is ready for future development

Work within the context of this repository and adapt the solution to the existing project structure.
Keep in mind that the project currently focuses on a browser-based arcade game, so the multiplayer implementation should be simple, fast, and ready for future expansion.

If there are ambiguities in the solution, choose a simple, stable, and well-documented implementation instead of a complex architecture.
