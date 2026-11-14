# Game Server

This service provides the realtime multiplayer backend for the ft_transcendence game.

## Features

- lobby creation and room join flow
- simple authoritative game state on the server
- Socket.IO event contract for gameplay updates
- `/health` endpoint for status checks
- Docker-ready setup

## Events

### Client -> server
- `room:create`
- `room:join`
- `room:start`
- `player:input`

### Server -> client
- `room:list`
- `room:joined`
- `room:update`
- `room:state`
- `server:welcome`

## Local run

```bash
npm install
npm run dev
```

The server listens on port `3001` by default.
