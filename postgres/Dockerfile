FROM postgres:18
USER root
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
COPY init-tls.sh /usr/local/bin/init-tls.sh
ENTRYPOINT ["sh", "/usr/local/bin/init-tls.sh"]
