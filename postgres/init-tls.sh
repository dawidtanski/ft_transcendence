#!/bin/sh
set -eu
umask 077

cert_dir=${TLS_CERT_DIR:-/tls}
ca_dir=${TLS_CA_DIR:-/ca}
public_dir=${TLS_PUBLIC_DIR:-/public}
pg_uid=${TLS_POSTGRES_UID:-$(id -u postgres)}
pg_gid=${TLS_POSTGRES_GID:-$(id -g postgres)}
mkdir -p "$cert_dir" "$ca_dir" "$public_dir"

# Never silently replace an existing trust identity or incomplete installation.
if [ -f "$cert_dir/ca.crt" ] && [ -f "$cert_dir/server.crt" ] && [ -f "$cert_dir/server.key" ]; then
    echo 'Validating existing PostgreSQL TLS certificates.'
else
    if [ -n "$(ls -A "$cert_dir")" ] || [ -n "$(ls -A "$ca_dir")" ]; then
        echo 'Incomplete TLS files: restore the existing certificates or move both certificate directories aside before generating a new identity.' >&2
        exit 1
    fi
    work_dir=$(mktemp -d)
    trap 'rm -rf "$work_dir"' EXIT HUP INT TERM
    openssl req -x509 -newkey rsa:4096 -nodes -sha256 \
        -keyout "$work_dir/ca.key" -out "$work_dir/ca.crt" \
        -days 3650 -subj '/CN=Galaga Local Development CA' \
        -addext 'basicConstraints=critical,CA:TRUE' \
        -addext 'keyUsage=critical,keyCertSign,cRLSign'
    openssl req -new -newkey rsa:2048 -nodes \
        -keyout "$work_dir/server.key" -out "$work_dir/server.csr" \
        -subj '/CN=postgres'
    cat > "$work_dir/server.ext" <<'EXT'
basicConstraints=critical,CA:FALSE
keyUsage=critical,digitalSignature,keyEncipherment
extendedKeyUsage=serverAuth
subjectAltName=DNS:postgres
EXT
    openssl x509 -req -in "$work_dir/server.csr" \
        -CA "$work_dir/ca.crt" -CAkey "$work_dir/ca.key" -CAcreateserial \
        -out "$work_dir/server.crt" -days 365 -sha256 \
        -extfile "$work_dir/server.ext"
    cp "$work_dir/ca.key" "$ca_dir/ca.key"
    cp "$work_dir/ca.crt" "$work_dir/server.crt" "$work_dir/server.key" "$cert_dir/"
fi

openssl verify -CAfile "$cert_dir/ca.crt" -purpose sslserver \
    -verify_hostname postgres "$cert_dir/server.crt"
openssl x509 -in "$cert_dir/server.crt" -checkend 0 -noout
cert_key=$(openssl x509 -in "$cert_dir/server.crt" -pubkey -noout)
private_key=$(openssl pkey -in "$cert_dir/server.key" -pubout)
if [ "$cert_key" != "$private_key" ]; then
    echo 'PostgreSQL certificate and private key do not match.' >&2
    exit 1
fi
chown "$pg_uid:$pg_gid" "$cert_dir/server.key"
chmod 600 "$cert_dir/server.key"
chmod 755 "$cert_dir" "$public_dir"
chmod 644 "$cert_dir/ca.crt" "$cert_dir/server.crt"
# Only the public CA is made available to applications.
cp "$cert_dir/ca.crt" "$public_dir/ca.crt.tmp"
chmod 644 "$public_dir/ca.crt.tmp"
mv "$public_dir/ca.crt.tmp" "$public_dir/ca.crt"
echo 'PostgreSQL TLS certificates ready.'
