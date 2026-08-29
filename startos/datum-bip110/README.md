# DATUM Blake2b Lab for StartOS

Experimental StartOS wrapper for Maveth's BLAKE2b DATUM Gateway branch, pinned
to commit `e82d7e5422cb3e425ab7f9d9cbe230b1bc7a2f11` and its verified source
tarball hash. This branch contains InnerHat's current BLAKE2b implementation
and adds the test-lab activation-headline and low-height regtest fixes.

The service can use either the official Start9 Bitcoin Knots package
(`bitcoind`) or the companion `bitcoin-bip110` lab package. The **Select
Bitcoin Node** action changes the active dependency. DATUM resolves the
selected node's StartOS bridge address at runtime. It authenticates to the
official package through its read-only RPC cookie and to the lab package with
its bridge-only RPC credentials. Switching does not move, copy, or delete
either node's blockchain data.

DATUM exports Sia-style BLAKE2b Stratum on raw TCP. This revision negotiates
the RC3 `blake2b` template rule, supports the canonical header-v2 layout,
copies the activation headline from `getblocktemplate` into the activation
coinbase, and validates/submits BLAKE2b work. Use the Apple miner's `--sia`
mode with this package. No remote DATUM pool is configured.

Maveth can fetch a DATUM pool public key when an external pool host is enabled.
This package deliberately leaves the pool host empty, so pool initialization
returns before that fetch path and mining remains local/solo.

The **Set Mining Identity** StartOS action persists validated primary and
secondary coinbase tags and restarts the gateway. These strings are embedded
in each solo-mined coinbase. Explorer branding remains registry-based: setting
a tag makes it visible on-chain, while the public explorer operator must map
that tag to a display name.

The **Set Solo Payout Address** action persists the address used for the
coinbase transaction output while no upstream DATUM pool is configured. The
gateway restarts after a change. Use a Bitcoin address appropriate for the
selected node network whose private key you control. Change it before moving
between a test network and mainnet.

The package exports a live pyblock-inspired monitoring dashboard on port 7152.
It reads DATUM's in-process gateway, Stratum, share, hashrate, identity, and
current-job values, refreshes them every five seconds, and keeps a short
browser-session hashrate chart and activity feed. No external service or
telemetry is involved. Configuration editing is disabled, and protected detail
pages use a generated password stored in the backed-up package volume. Retrieve
it with the **Dashboard Credentials** StartOS action.

DATUM calculates the actual difficulty of every locally accepted share. It
persists the known-history best share, best share since the last accepted
block, and accepted block records in `/data/mining-history.json`. StartOS backs
up that file with the package's `main` volume. The history key combines the PoW
algorithm, node-reported network, and genesis hash. Switching between compatible
node packages on the same chain keeps the same history; another network or PoW
uses a separate record.

The dashboard exposes this data on the Mine page and a separate **Mined
Blocks** page. `/api/best-shares` returns the persistent summary plus live
per-client bests. `/api/mined-blocks` returns the active chain's full recorded
block list. Client bests still reset on reconnect. Mining history is private
runtime data and is not bundled into the package image.

The imported `best_since_last_block` is marked incomplete because older DATUM
versions retained only one process-wide maximum. New record shares improve the
known lower bound. The field becomes complete when DATUM accepts the next block
and resets the post-block maximum itself.

For browser interoperability, protected pages use HTTP Basic authentication
through the StartOS HTTPS interface. The generated password is long and
random, configuration editing remains disabled, and the dashboard's internal
HTTP port should not be exposed directly outside StartOS. Basic credentials
are only protected in transit by HTTPS, so do not use the internal HTTP port.

Supported StartOS architectures: x86_64 and aarch64.
