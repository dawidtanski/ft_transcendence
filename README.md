ft_transcendence
Final 42 project. Web browser Arcade game.

// download resources, build network, volumens, run containers in background(-d) , if there are changes rebuild (--build) docker compose up -d --build

// Dependencies to set environment (Crucial for docker compose) npm install && npm dev

// npm ci ( to set up environment when there's no folder dependencies)

// pg - library, which allows to communicate with postgres

// password to DB is needed to change

// Project has to have two networks for production - one for db and one for frontend

// db migration docker compose up -d --build nextjs docker compose exec nextjs npx drizzle-kit migrate docker compose up -d nginx

// Rebuild a docker container and run migration inside of it
docker compose up -d --build nextjs
docker compose exec nextjs npm run db:migrate