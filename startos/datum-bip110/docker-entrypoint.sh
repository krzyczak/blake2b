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

# Validate typed environment values before replacing the working configuration.
POOL_SETTINGS_JSON="$(jq --null-input --compact-output \
    --arg host "${DATUM_POOL_HOST:-}" \
    --arg port "${DATUM_POOL_PORT:-28915}" \
    --arg key "${DATUM_POOL_PUBKEY:-}" \
    --arg workers "${DATUM_POOL_PASS_WORKERS:-false}" \
    --arg users "${DATUM_POOL_PASS_FULL_USERS:-false}" \
    --arg only "${DATUM_POOLED_MINING_ONLY:-false}" \
    --arg difficulty "${DATUM_VARDIFF_MIN:-1}" \
    --arg shares "${DATUM_VARDIFF_TARGET_SHARES_MIN:-8}" '
  def integer($max):
    tonumber | if . >= 1 and . <= $max and floor == . then .
    else error("Pool numeric setting is out of range") end;
  def boolean:
    if . == "true" then true elif . == "false" then false
    else error("Pool boolean setting must be true or false") end;
  {
    datum: {
      pool_host: $host,
      pool_port: ($port | integer(65535)),
      pool_pubkey: $key,
      pool_pass_workers: ($workers | boolean),
      pool_pass_full_users: ($users | boolean),
      pooled_mining_only: ($only | boolean)
    },
    vardiff_min: ($difficulty | integer(1073741824)),
    vardiff_target_shares_min: ($shares | integer(120))
  }
  | if (.vardiff_min | until(. <= 1; . / 2)) != 1 then
      error("Minimum difficulty must be a power of two")
    elif $host != "" and ($key | length != 128 or (test("^[a-fA-F0-9]{128}$") | not)) then
      error("Pool public key must contain 128 hexadecimal characters")
    elif $host == "" and .datum.pooled_mining_only then
      error("Pool mining only requires a pool host")
    else . end
')"
POOL_CONFIG_JSON="$(printf '%s' "$POOL_SETTINGS_JSON" | jq --compact-output '.datum')"
VARDIFF_MIN="$(printf '%s' "$POOL_SETTINGS_JSON" | jq '.vardiff_min')"
TARGET_SHARES="$(printf '%s' "$POOL_SETTINGS_JSON" | jq '.vardiff_target_shares_min')"

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

# Seed user settings only once; the web dashboard owns them after that.
# Write atomically so a failed merge leaves the last working config intact.
GENERATED_CONFIG="$(mktemp "$DATA_DIR/config.generated.XXXXXX")"
MERGED_CONFIG="$(mktemp "$DATA_DIR/config.merged.XXXXXX")"
trap 'rm -f "$GENERATED_CONFIG" "$MERGED_CONFIG"' EXIT HUP INT TERM
cat > "$GENERATED_CONFIG" <<EOF
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
    "vardiff_min": ${VARDIFF_MIN},
    "vardiff_target_shares_min": ${TARGET_SHARES},
    "share_stale_seconds": 120
  },
  "mining": {
    "pool_address": ${POOL_ADDRESS_JSON},
    "coinbase_tag_primary": ${COINBASE_TAG_PRIMARY_JSON},
    "coinbase_tag_secondary": ${COINBASE_TAG_SECONDARY_JSON},
    "coinbase_unique_id": 4242,
    "abw_verify_all_shares_on_disclosure": true,
    "history_file": "${DATA_DIR}/mining-history.json",
    "history_source_node": ${HISTORY_SOURCE_NODE_JSON}
  },
  "api": {
    "admin_password": ${DASHBOARD_ADMIN_PASSWORD_JSON},
    "listen_addr": "0.0.0.0",
    "listen_port": 7152,
    "allow_insecure_auth": true,
    "modify_conf": true
  },
  "logger": {
    "log_to_console": true,
    "log_to_stderr": false,
    "log_to_file": false,
    "log_level_console": 1
  },
  "datum": ${POOL_CONFIG_JSON}
}
EOF

if [ -f "$DATA_DIR/config.json" ]; then
    jq --slurp '
      .[0] as $managed | .[1] as $saved
      | if ($saved | type) != "object" then error("Invalid saved DATUM config") else
          $managed * $saved
          | .bitcoind |= (del(.rpcuser, .rpcpassword, .rpccookiefile)
              + ($managed.bitcoind | {rpcurl} +
                  (if has("rpccookiefile") then {rpccookiefile} else {rpcuser, rpcpassword} end)))
          | .api = $managed.api
          | .stratum.listen_addr = $managed.stratum.listen_addr
          | .stratum.listen_port = $managed.stratum.listen_port
          | .mining.history_file = $managed.mining.history_file
          | .mining.history_source_node = $managed.mining.history_source_node
          | .mining.abw_verify_all_shares_on_disclosure = true
          | del(.mining.pow_algorithm)
        end
    ' "$GENERATED_CONFIG" "$DATA_DIR/config.json" > "$MERGED_CONFIG"
else
    cp "$GENERATED_CONFIG" "$MERGED_CONFIG"
fi
mv "$MERGED_CONFIG" "$DATA_DIR/config.json"
rm -f "$GENERATED_CONFIG"
trap - EXIT HUP INT TERM

exec /app/datum_gateway --config "$DATA_DIR/config.json"
