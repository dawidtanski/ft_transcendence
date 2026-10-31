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
## Automatic PostgreSQL TLS (local development)

After cloning, copy `.env.example` to `.env`, configure credentials, and run `make up` (or `docker compose up -d --build`). No host OpenSSL installation or manual certificate generation is needed.

Compose first runs `postgres-tls`, an isolated initialization container. It generates a local CA and a certificate for the Docker hostname `postgres`, sets the server key permissions using the PostgreSQL image's user ID, and exits. PostgreSQL waits for successful initialization; Next.js waits for PostgreSQL health.

- `postgres/ca/`: private signing key, mounted only in the initialization service.
- `postgres/certs/`: CA certificate, server certificate and private server key; mounted read-only in PostgreSQL.
- `postgres/public/`: public CA certificate only; mounted read-only in Next.js.

All three directories are ignored by Git and excluded from the Docker build context. Each developer generates a separate identity for their own local database. The local CA key is unencrypted for unattended initialization; keep these directories private. This setup is intended for local development.

Existing complete certificates are validated and reused, including manually generated certificates. The script rejects partial files, expired certificates, an incorrect hostname, or a mismatched server key rather than silently replacing them. A fresh CA lasts 10 years and the server certificate lasts 1 year. Renewal is manual; automatic rotation is not enabled.

Inspect initialization with `docker compose logs postgres-tls`. After modifying or restoring certificates, rerun initialization explicitly:

```sh
docker compose run --rm postgres-tls
docker compose restart postgres nextjs
```

To intentionally reset a disposable local TLS identity, stop the services and move BOTH `postgres/ca` and `postgres/certs` aside, then run `make up`. Keep backups until startup succeeds. The initializer republishes `postgres/public/ca.crt`; never remove `storage/postgres` for a certificate reset. Other clients using the old CA must receive the new public certificate.

TLS is configured for Next.js and Drizzle. PostgreSQL does not yet reject all non-TLS clients; that requires separate `pg_hba.conf` rules. Migrations remain an explicit operation:

```sh
docker compose exec nextjs npm run db:migrate
```
