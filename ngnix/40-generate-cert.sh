#!/bin/sh
set -eu
umask 077

cert_dir="/etc/nginx/certs"
cert="$cert_dir/localhost.crt"
key="$cert_dir/localhost.key"

set -f
saved_ifs="$IFS"
IFS=,
set -- ${TLS_IPS:-}
IFS="$saved_ifs"

mkdir -p "$cert_dir"

san="DNS:localhost,IP:127.0.0.1"

for ip in "$@"; do
    case "$ip" in
        ''|*[!0-9.]*)
            echo "Bad IPv4 for cert.: $ip" >&2
            exit 1
            ;;
    esac

    san="$san,IP:$ip"
done

certificate_is_valid() {
    [ -s "$cert" ] && [ -s "$key" ] || return 1

    openssl x509 -in "$cert" -checkend 86400 -noout \
        >/dev/null 2>&1 || return 1

    openssl verify -CAfile "$cert" \
        -verify_hostname localhost "$cert" \
        >/dev/null 2>&1 || return 1

    openssl verify -CAfile "$cert" \
        -verify_ip 127.0.0.1 "$cert" \
        >/dev/null 2>&1 || return 1

    cert_public="$(openssl x509 -in "$cert" -pubkey -noout)" || return 1
    key_public="$(openssl pkey -in "$key" -pubout)" || return 1

    [ "$cert_public" = "$key_public" ] || return 1

    for ip in "$@"; do
        openssl verify -CAfile "$cert" \
            -verify_ip "$ip" "$cert" \
            >/dev/null 2>&1 || return 1
    done
}

if certificate_is_valid "$@"; then
    chmod 600 "$key"
    echo "TLS: cetr. already existing, in use..."
    exit 0
fi

tmp_dir="$(mktemp -d "$cert_dir/.generate-XXXXXX")"
trap 'rm -rf "$tmp_dir"' EXIT

openssl req -x509 -nodes -newkey rsa:2048 \
    -days 365 \
    -subj "/CN=localhost" \
    -addext "subjectAltName=$san" \
    -keyout "$tmp_dir/localhost.key" \
    -out "$tmp_dir/localhost.crt"

chmod 600 "$tmp_dir/localhost.key"
chmod 644 "$tmp_dir/localhost.crt"

mv "$tmp_dir/localhost.key" "$key"
mv "$tmp_dir/localhost.crt" "$cert"

echo "TLS: cert configured for $san"
