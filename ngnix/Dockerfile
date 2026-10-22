FROM nginx:1.30.6

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY --chmod=755 40-generate-cert.sh /docker-entrypoint.d/40-generate-cert.sh
