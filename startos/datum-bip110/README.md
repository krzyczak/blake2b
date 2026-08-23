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

Supported StartOS architectures: x86_64 and aarch64.
