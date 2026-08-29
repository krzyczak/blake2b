#!/bin/sh
set -eu

if [ "$#" -ne 1 ] || [ -z "$1" ]; then
    echo "usage: datum-bip110-entrypoint BITCOIN_RPC_HOST:PORT" >&2
    exit 64
fi

BITCOIN_RPC_ADDRESS="$1"
DATA_DIR=/data
COINBASE_TAG_PRIMARY="${DATUM_COINBASE_TAG_PRIMARY:-Totoro}"
COINBASE_TAG_SECONDARY="${DATUM_COINBASE_TAG_SECONDARY:-StartOS-BIP110}"
POOL_ADDRESS="${DATUM_POOL_ADDRESS:-mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn}"
DASHBOARD_ADMIN_PASSWORD="${DATUM_DASHBOARD_ADMIN_PASSWORD:?DATUM dashboard password is required}"
HISTORY_SOURCE_NODE="${DATUM_NODE_PACKAGE_ID:-}"

json_string() {
    jq --null-input --compact-output --arg value "$1" '$value'
}

if [ -n "${DATUM_RPC_COOKIE_FILE:-}" ]; then
    RPC_AUTH_CONFIG="\"rpccookiefile\": $(json_string "$DATUM_RPC_COOKIE_FILE")"
else
    RPC_USER="${DATUM_RPC_USER:?Bitcoin RPC username is required}"
    RPC_PASSWORD="${DATUM_RPC_PASSWORD:?Bitcoin RPC password is required}"
    RPC_AUTH_CONFIG="\"rpcuser\": $(json_string "$RPC_USER"),
    \"rpcpassword\": $(json_string "$RPC_PASSWORD")"
fi

RPC_URL_JSON="$(json_string "http://${BITCOIN_RPC_ADDRESS}")"
COINBASE_TAG_PRIMARY_JSON="$(json_string "$COINBASE_TAG_PRIMARY")"
COINBASE_TAG_SECONDARY_JSON="$(json_string "$COINBASE_TAG_SECONDARY")"
POOL_ADDRESS_JSON="$(json_string "$POOL_ADDRESS")"
DASHBOARD_ADMIN_PASSWORD_JSON="$(json_string "$DASHBOARD_ADMIN_PASSWORD")"
HISTORY_SOURCE_NODE_JSON="$(json_string "$HISTORY_SOURCE_NODE")"

mkdir -p "$DATA_DIR"
umask 077

cat > "$DATA_DIR/config.json" <<EOF
{
  "bitcoind": {
    ${RPC_AUTH_CONFIG},
    "rpcurl": ${RPC_URL_JSON},
    "work_update_seconds": 5,
    "notify_fallback": true
  },
  "stratum": {
    "listen_addr": "0.0.0.0",
    "listen_port": 23334,
    "vardiff_min": 1,
    "vardiff_target_shares_min": 8,
    "share_stale_seconds": 120
  },
  "mining": {
    "pool_address": ${POOL_ADDRESS_JSON},
    "coinbase_tag_primary": ${COINBASE_TAG_PRIMARY_JSON},
    "coinbase_tag_secondary": ${COINBASE_TAG_SECONDARY_JSON},
    "coinbase_unique_id": 4242,
    "pow_algorithm": "auto",
    "history_file": "${DATA_DIR}/mining-history.json",
    "history_source_node": ${HISTORY_SOURCE_NODE_JSON}
  },
  "api": {
    "admin_password": ${DASHBOARD_ADMIN_PASSWORD_JSON},
    "listen_addr": "0.0.0.0",
    "listen_port": 7152,
    "allow_insecure_auth": true,
    "modify_conf": false
  },
  "logger": {
    "log_to_console": true,
    "log_to_stderr": false,
    "log_to_file": false,
    "log_level_console": 1
  },
  "datum": {
    "pool_host": "",
    "pool_pass_workers": false,
    "pool_pass_full_users": false,
    "pooled_mining_only": false
  }
}
EOF

exec /app/datum_gateway --config "$DATA_DIR/config.json"
