# DATUM upstream review — 2026-09-08

Keep the StartOS wrapper and update its gateway source for current CONVOY-compatible pools. Configuration alone cannot bridge the protocol differences in the pinned binary. Maveth master is the candidate base: it contains CONVOY master plus two coinbase fixes. This is a source review, not a tested deployment recommendation.

## Revisions checked

Live Git fetches, not GitHub page commit counts. Counts include merge commits and describe ancestry, not independent features.

| Source | Head | Difference from our pinned source |
| --- | --- | --- |
| Our Dockerfile | `e82d7e5422cb3e425ab7f9d9cbe230b1bc7a2f11`, August 26 | Maveth lab source plus three local patches and replacement dashboard |
| Maveth `bip110-pow-v2` and `bip110-pow-v2-innerhat` | `e82d7e5`, August 26 | No new commits on those branches |
| [Maveth master](https://github.com/Maveth/datum_gateway/commit/7491a5099dd5d887a027c812f71de63e0d5986a3) | `7491a50`, September 5 | 58 commits absent from our pin; our pin has 4 commits absent from master |
| [CONVOY master](https://github.com/CONVOYMining/datum_gateway/commit/b9ea7dc3eb91352565ab487ec55ed6ee5964a440) | `b9ea7dc`, September 3 | 56 commits absent from our pin; our pin has 4 commits absent from CONVOY |
| [luke-jr master](https://github.com/luke-jr/datum_gateway/commit/1fb68d6df6e75e4c6bd91c8c229de33d02e07a50) | `1fb68d6`, September 1 | 28 commits absent from our pin; included in current CONVOY |
| [OCEAN master](https://github.com/OCEAN-xyz/datum_gateway/commit/dbc3b143589842feb606a409b40cd70f67117b45) | `dbc3b14`, August 5 | Already an ancestor of our pin; no missing commits from this branch |

CONVOY versus the pinned source: 57 files changed, 4,688 insertions, 2,169 deletions, including tests, documentation, and branding. Backporting the pool stack is not a small configuration patch.

## Material CONVOY differences

| Area | Change and consequence |
| --- | --- |
| Server configuration wire format | Our parser requires version `1` and reads a 32-bit Prime ID; CONVOY requires version `3`, a 64-bit ID, a resume token, and ABW flags. Our parser rejects a version-3 configuration before mining becomes ready. |
| BLAKE2b anti-block-withholding (ABW) | Key-hash assignments, candidate receipts, key disclosure, block recovery, and retained-proof verification; optional pool-disabled ABW and readiness gating. Our pin lacks this machinery. |
| Payout commitments | Commits the selected coinbase into BLAKE2b work rather than always using class 0; relevant to pooled payout correctness. |
| Connection recovery | Session resumption, server-directed migration, replay handling, stale-send rejection, and job-cache invalidation; prevents stale context and share loss across reconnects. |
| Template validation transport | Bulk framing for large replies and fetching/uploading parent blocks unknown to the pool. |
| Mining work | Immediate subsidy-only work on new blocks, hidden network target, H-not-zero validation, difficulty formatting/configure fixes, and rollback of failed mining notifications. |
| Node contract | Uses the released `blake2b` GBT rule contract; removes legacy header-field parsing and SHA256d/version-rolling support. Requires a compatible BLAKE2b node and chain. |
| Error handling | Correct `submitblock` success/error interpretation, JSON cleanup, failed authentication with no admin password, bounds on pool scripts/tags, and coinbase tag-space accounting. |
| Other | CONVOY branding/default endpoint/default public key, socket portability and runtime error handling, macOS restart fixes, CI and expanded tests. |

Wire-format evidence: [our version-1 parser](https://github.com/Maveth/datum_gateway/blob/e82d7e5422cb3e425ab7f9d9cbe230b1bc7a2f11/src/datum_protocol.c#L416) and [CONVOY version-3 parser](https://github.com/CONVOYMining/datum_gateway/blob/b9ea7dc3eb91352565ab487ec55ed6ee5964a440/src/datum_protocol.c#L1367).

Relevant changes: [payout commitments](https://github.com/CONVOYMining/datum_gateway/commit/155b6bf4382b309df9915fb3f49d6229cd7f1d17), [ABW](https://github.com/CONVOYMining/datum_gateway/commit/474f115), [64-bit IDs](https://github.com/CONVOYMining/datum_gateway/commit/c57018a), [GBT contract](https://github.com/CONVOYMining/datum_gateway/commit/b5d22845e306bc623bf5204ea26044ee6830142a), [block submission errors](https://github.com/CONVOYMining/datum_gateway/commit/39e0de7).

Both revisions still advertise `v0.4.1-beta`; that user-agent string does not establish wire compatibility.

## What Maveth adds beyond CONVOY

Exactly two commits on master as checked:

- [`40cf813`](https://github.com/Maveth/datum_gateway/commit/40cf813): constrains selected coinbaser outputs by the template sigop budget and uses the largest coinbase class for BLAKE2b miners, whose hardware receives a commitment rather than the full transaction.
- [`7491a50`](https://github.com/Maveth/datum_gateway/commit/7491a5099dd5d887a027c812f71de63e0d5986a3): accounts for the 164-byte header in block weight and corrects coinbase static-byte accounting from 119 to 124.

These address payout capacity and block validity near template limits, not the initial encrypted connection. They make Maveth master a useful candidate rather than switching to CONVOY solely for its repository name.

## Changes needed in our package

1. Update the Dockerfile source commit and verified tarball SHA-256 together.
2. Port `browser-auth-compat.patch` and `best-share.patch`. Dry runs against Maveth master fail for both. `configured-payout-address.patch` passes its independent dry run, but the combined port still needs checking.
3. Adapt history to ABW: current hooks assume locally reconstructed block candidates and local submitblock results. Pool key disclosure/recovered blocks need the corresponding history path; pool payout splits must not be presented as an entire reward paid to the configured solo address.
4. Preserve the lab activation-headline injection and BIP34 encoding at heights 0–16 if dummy/regtest workflows remain supported. Current Maveth/CONVOY master omits these lab customizations. The companion node's dummy activation at height 20 depends on the headline path.
5. Add persistent StartOS pool settings, an action to edit them, environment wiring in `startos/main.ts`, and JSON generation in `docker-entrypoint.sh`.
6. Remove or adapt `mining.pow_algorithm: "auto"` for the new BLAKE2b-only source. Ensure node selection matches the pool's network and consensus; an ordinary SHA256d node cannot provide its work.
7. Port and run the gateway tests, build both package architectures, and verify actual pool acceptance and reconnects before deploying.

## Supplied pool configuration

All supplied setting names already exist in the old gateway. The immediate wrapper limitation is that `docker-entrypoint.sh` regenerates `/data/config.json` on every start with an empty pool host, disabled username forwarding, and solo fallback enabled. Manual edits do not persist, and dashboard configuration editing is disabled.

| Setting | Required wrapper behavior |
| --- | --- |
| `stratum.vardiff_min` | Configurable; `4096` is a valid power of two, replacing the current `1` |
| `stratum.vardiff_target_shares_min` | Already `8` |
| `datum.pool_host` | Persist the actual DATUM endpoint hostname |
| `datum.pool_port` | Persist `28915` or the pool-specified port |
| `datum.pool_pubkey` | Persist and validate the pool's 128 hexadecimal characters; do not inherit another pool's default key |
| `datum.pool_pass_workers` | Set `true` as requested |
| `datum.pool_pass_full_users` | Set `true`; ordinary nonempty miner usernames are forwarded verbatim, so configure the payout address/account and worker syntax expected by the pool |
| `datum.pooled_mining_only` | Set `true`; unavailable pool means mining stops rather than falling back to solo |

With full-user forwarding, a bare worker name is not automatically prefixed with our payout address. Empty usernames fall back to `mining.pool_address`; leading-dot worker names are appended to it. Keep that address valid for the selected network.

The supplied JSON is a fragment to merge into our generated configuration; retain node RPC, mining identity, logging, dashboard, and history settings. Miners continue connecting to our Stratum listener on port `23334`; the gateway makes an outbound DATUM connection to port `28915`. A hostname beginning with `stratum` does not identify its protocol: that port must serve DATUM, not ordinary Stratum V1.

The old Maveth pin includes public-key auto-fetch; the new source's `datum_protocol_init` fails on a missing/invalid key despite a stale configuration description mentioning auto-fetch. An explicit key as supplied avoids this difference.

For a legacy pool deliberately supporting the old wire format, wrapper configuration could enable a connection, but the BLAKE2b payout-commitment defect still needs fixing and acceptance needs testing. The placeholder hostname/key cannot establish which server implementation is actually used.

## Verification and limits

- Inspected local wrapper, all three patches, current node package configuration, fetched Git histories, and source diffs.
- Checked parser versions directly, ancestor relationships, Maveth-versus-CONVOY differences, and patch applicability in temporary checkouts.
- Native CMake configuration stopped because `jansson` is missing; no packages installed and no compiled test result claimed.
- No live pool connection attempted: hostname and public key are placeholders.
- No runtime code, configuration, source pin, or deployed service changed by this review.
