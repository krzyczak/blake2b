# Bitcoin Blake2b Lab for StartOS

Experimental StartOS package pinned to Bitcoin Knots tag
`v29.4.1.knots20260508rc5`, peeled commit
`306523a567d5cf17d1939dc485be57a5ae83cfe7`, and a verified source-tarball
SHA-256.

Use the **Select Network** action to choose one of four modes:

- `dummy` preserves the original package behavior. It uses the existing
  `/data` datadir, creates 19 validated SHA256d regtest blocks, and leaves the
  BLAKE2b activation block at height 20 for the external miner. Its private
  headline remains `BIP110-LAB` for compatibility with existing dummy chains.
- `testnet4` joins and validates the public testnet4 chain. RC5 activates
  BLAKE2b at height 150308 and takes its public-network consensus parameters
  directly from the binary.
- `signet` joins the public default signet. Its blocks additionally require an
  authorized signet block signature, so this BLAKE2b miner cannot mine public
  signet by itself.
- `regtest` starts a separate, ordinary local regtest at genesis without the
  dummy bootstrap or a public peer network.

Public modes perform a real Initial Block Download. They use pruning to limit
retained block data, but do not fake validation state. Each non-dummy mode has
its own datadir under `/data/networks`, so changing networks does not mix chain
state.

RC5 accepts `blake2b_headline` only on regtest with an explicit BLAKE2b
activation height. The package therefore sets it only for the dummy chain at
height 20. A narrow RPC compatibility patch exposes the selected headline in
`getblocktemplate` at that activation block. The modified DATUM gateway inserts
it into the coinbase, and the miner hashes the job.

The **Set BLAKE2b Headline** action is visible only in dummy mode. It restarts
the service when running. Input is limited to one printable ASCII line to
prevent generated-configuration injection. Changing it creates a different
dummy activation block; it is not a miner branding field.

Supported StartOS architectures: x86_64 and aarch64.
