# DATUM BIP110 Gateway for StartOS

Experimental StartOS wrapper for Maveth's BLAKE2b DATUM Gateway branch, pinned
to commit `e82d7e5422cb3e425ab7f9d9cbe230b1bc7a2f11` and its verified source
tarball hash. This branch contains InnerHat's current BLAKE2b implementation
and adds the test-lab activation-headline and low-height regtest fixes.

The service requires the companion `bitcoin-bip110` package. It discovers the
node's StartOS bridge address at runtime and exports Sia-style BLAKE2b Stratum
on raw TCP. This revision negotiates the RC3 `blake2b` template rule, supports
the canonical header-v2 layout, copies the activation headline from
`getblocktemplate` into the activation coinbase, and validates/submits
BLAKE2b work. Use the Apple miner's `--sia` mode with this package. No remote
DATUM pool is configured.

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
selected node network whose private key you control.

The package exports DATUM's built-in monitoring dashboard on port 7152. It
shows gateway, Stratum, share, client, hashrate, coinbaser, and job status.
Configuration editing is disabled, and protected detail pages use a generated
password stored in the backed-up package volume. Retrieve it with the
**Dashboard Credentials** StartOS action.

For browser interoperability, protected pages use HTTP Basic authentication
through the StartOS HTTPS interface. The generated password is long and
random, configuration editing remains disabled, and the dashboard's internal
HTTP port should not be exposed directly outside StartOS. Basic credentials
are only protected in transit by HTTPS, so do not use the internal HTTP port.

Supported StartOS architectures: x86_64 and aarch64.
