# DATUM Blake2b Lab for StartOS

StartOS wrapper for Maveth DATUM Gateway, pinned to
`7491a5099dd5d887a027c812f71de63e0d5986a3` with a verified source archive
SHA-256. This revision includes the CONVOY BLAKE2b pool protocol, ABW,
session resumption, and Maveth's coinbase sigop/weight fixes.
The source commit and archive checksum are defined in the Dockerfile; the
StartOS manifest uses those defaults without overriding them.

**Select Bitcoin Node** chooses the official Start9 `bitcoind` package or
the companion `bitcoin-bip110` lab package. StartOS resolves the selected
node's RPC bridge address and uses its read-only cookie or lab credentials.
The node must supply the `blake2b` GBT rule on the intended network. This
gateway no longer mines SHA256d templates. Switching nodes does not move or
delete blockchain data.

Miners use Sia-style BLAKE2b Stratum on port 23334. Use the Apple miner's
`--sia` mode. The gateway connects to the pool through DATUM, not Stratum V1.

## Pool settings

Open **Config** in the DATUM web dashboard and sign in with the credentials
from **Actions → Dashboard Credentials**. Set **Collaborative reward sharing**
to **require (pooled mining only)**, enter the pool host, port, and public key,
then set **Minimum share difficulty** and **Target shares per minute** under
**Advanced**. For full username forwarding, choose **Override Bitcoin Address**
under **Send Miner Usernames To Pool**, then click **Save**.

The web dashboard and **Actions → Configure DATUM Pool** share
`/data/config.json`, which StartOS backs up with the package volume.
Changes that require a gateway restart trigger one automatically.
Existing installations and fresh installs default to solo mining with
difficulty 1 and eight shares per minute.

To pool mine, enable the pool and enter its DATUM hostname/IP, port, and
128-character hexadecimal public key. Enter the values supplied by the pool,
for example port 28915, difficulty 4096, eight shares per minute, full-username
forwarding enabled, and pool-only mining enabled. Host, key, numeric ranges,
and power-of-two difficulty are validated before saving. Invalid stored pool
settings cause an error instead of silently enabling solo fallback.

With **Forward Full Usernames** enabled, nonempty miner usernames are sent
verbatim. Set the payout address or account/worker syntax required by the
pool on each miner. Leading-dot worker names are appended to the configured
payout address; empty names use that address. A bare `local.worker` is not
automatically converted into a payout address.

**Pool Mining Only** stops mining when the pool is unavailable. Turning it
off permits solo fallback to the configured solo payout address. Disabling
the pool restores solo mode while retaining the saved connection settings.
The pool and selected node must use the same network and BLAKE2b consensus.

The entrypoint seeds the config from legacy `/data/startos-mining.json`
settings on first creation, then preserves saved mining and pool settings.
On startup it refreshes the StartOS node RPC connection, dashboard credentials,
listener addresses/ports, and history location. Use **Select Bitcoin Node**
to change the node; RPC edits in the DATUM panel are replaced at package restart.
An explicit pool public key is required; this revision has no key auto-fetch.

## Local patches

- `browser-auth-compat.patch`: HTTP Basic authentication for protected pages
  through the StartOS HTTPS interface, including rejection when no admin
  password is configured.
- `web-config.patch`: editable share difficulty/target fields and pool public
  key validation in the web configuration form.
- `best-share.patch`: chain-scoped persistent share/block history and API
  endpoints, including confirmed blocks reconstructed after ABW key disclosure.
- `configured-payout-address.patch`: preserves the configured address's
  network prefix in the solo coinbaser display.
- `lab-compat.patch`: copies activation headlines from GBT `coinbaseaux` into
  the matching template's coinbase and preserves BIP34 encoding at heights
  0–16. Optional identity tags yield space to the headline within the 100-byte
  coinbase input limit. No forced BIP9 bit is added.

The lab patch preserves dummy activation at height 20. The companion node
boots that chain to height 19 itself. Ordinary regtest without BLAKE2b
activation cannot supply work to this BLAKE2b-only gateway.

## Identity and monitoring

**Set Mining Identity** persists primary/secondary coinbase tags.
**Set Solo Payout Address** sets the solo/fallback recipient; replace the
disposable initial test address with one whose key you control on the selected
network. Pool coinbases distribute rewards according to the pool's outputs.

The dashboard on port 7152 refreshes gateway, miner, share, and job data every
five seconds. **Dashboard Credentials** returns the generated password.
Authenticated configuration editing is enabled. Use protected pages through
StartOS HTTPS; do not expose the internal HTTP port.

`/data/mining-history.json` stores known-history best work, best work since
the last recorded block, and accepted block records. The history key contains
PoW, network, and genesis hash. Compatible node switches retain history;
different chains use different records. Per-client bests reset on reconnect.

Best work uses the raw work hash. With ABW active, that hash cannot identify
a network block before key disclosure; the dashboard marks this distinction.
The submission thread records blocks after the configured node accepts them,
including ABW reconstructions and already accepted duplicates. It reads
`getblock` with verbosity 2 for actual block time, height, and total coinbase
output value. Pooled records have no single payout address, and the dashboard
labels their reward as shared by the pool. Duplicate submissions do not add
duplicate records. RPC/read/write failures are logged.

`/api/best-shares` exposes persistent and per-client bests;
`/api/mined-blocks` exposes the active chain's recorded blocks. Imported
post-block bests remain marked incomplete until the next recorded block.
The history records acceptance, not continuing canonical-chain membership.

## Validation

```sh
npm run check
npm run test:pool
npm run test:manifest
rbenv exec ruby tests/entrypoint.rb
npm run build
```

The Docker build runs the authenticated web editing and restart tests, plus
`datum_gateway --test`, including the protocol/ABW,
lab coinbase, submission-response, and persistent-history tests. The StartOS
workflow runs the controller/configuration checks for x86_64 and aarch64
before building each package. A live connection still requires the actual
pool endpoint, public key, and miner identity.
