# DATUM BIP110 Gateway for StartOS

Experimental StartOS wrapper for Justin Filip's integrated BLAKE2b DATUM
Gateway fork, pinned to commit
`56c31f40c83c3c8315694617082456677799e43a` and its verified source tarball
hash.

The service requires the companion `bitcoin-bip110` package. It discovers the
node's StartOS bridge address at runtime and exports Sia-style BLAKE2b Stratum
on raw TCP. This revision negotiates the RC2 `blake2b` template rule, supports
the canonical header-v2 layout, and validates/submits BLAKE2b work. Use the
Apple miner's `--sia` mode with this package. No remote DATUM pool is
configured.

The **Set Mining Identity** StartOS action persists validated primary and
secondary coinbase tags and restarts the gateway. These strings are embedded
in each solo-mined coinbase. Explorer branding remains registry-based: setting
a tag makes it visible on-chain, while the public explorer operator must map
that tag to a display name.

The **Set Solo Payout Address** action persists the address used for the
coinbase transaction output while no upstream DATUM pool is configured. The
gateway restarts after a change. Use a Bitcoin address appropriate for the
selected node network whose private key you control.

The package exports DATUM's built-in monitoring dashboard on port 7152. It
shows gateway, Stratum, share, client, hashrate, coinbaser, and job status.
Configuration editing is disabled, and protected detail pages use a generated
password stored in the backed-up package volume. Retrieve it with the
**Dashboard Credentials** StartOS action.

For browser interoperability, protected pages use legacy MD5 HTTP Digest
authentication through the StartOS HTTPS interface. The generated password is
long and random, configuration editing remains disabled, and the dashboard's
internal HTTP port should not be exposed directly outside StartOS.

Supported StartOS architectures: x86_64 and aarch64.
