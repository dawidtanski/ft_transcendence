#!/usr/bin/env bash
set -euo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

if [[ -n "${WSL_DISTRO_NAME:-}" || "$(uname -r)" == *[Mm]icrosoft* ]]; then
    if ! command -v powershell.exe >/dev/null 2>&1; then
        echo "WSL: powershell.exe unavalible. check Windows interop." >&2
        exit 1
    fi

    addresses="$(powershell.exe -NoProfile -NonInteractive -Command '
        $ErrorActionPreference = "Stop"

        $connected = @(Get-NetIPInterface `
            -AddressFamily IPv4 `
            -ConnectionState Connected |
            Select-Object -ExpandProperty InterfaceIndex)

        Get-NetIPAddress -AddressFamily IPv4 -AddressState Preferred |
            Where-Object {
                $_.InterfaceIndex -in $connected -and
                $_.IPAddress -notmatch "^(127\.|169\.254\.)" -and
                $_.InterfaceAlias -notmatch "^(vEthernet|Docker)"
            } |
            Select-Object -ExpandProperty IPAddress
    ' | tr -d '\r')"
else
    addresses="$(ip -o -4 addr show up scope global | awk '
        $2 !~ /^(docker[0-9]*|br-.*|veth.*|virbr.*)$/ {
            split($4, address, "/")
            print address[1]
        }
    ')"
fi

tls_ips="$(
    printf '%s\n' "$addresses" |
        sed '/^[[:space:]]*$/d' |
        sort -u |
        paste -sd, -
)"

echo "Certificate IPs: ${tls_ips:-localhost only}"

if docker info >/dev/null 2>&1; then
    TLS_IPS="$tls_ips" docker compose up -d --build
else
    sudo env TLS_IPS="$tls_ips" docker compose up -d --build
fi
