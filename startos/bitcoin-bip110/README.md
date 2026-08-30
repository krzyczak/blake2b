# Bitcoin Blake2b Lab for StartOS

Experimental StartOS package pinned to Bitcoin Knots tag
`v29.4.1.knots20260508rc4`, peeled commit
`dc82be77dd741dfa63e1f816367b15364d55b051`, and a verified source-tarball
SHA-256.

Use the **Select Network** action to choose one of four modes:

- `dummy` preserves the original package behavior. It uses the existing
  `/data` datadir, creates 19 validated SHA256d regtest blocks, and leaves the
  BLAKE2b activation block at height 20 for the external miner. Its private
  headline remains `BIP110-LAB` for compatibility with existing dummy chains.
- `testnet4` joins and validates the public testnet4 chain. RC4 activates
  BLAKE2b at height 150308. The package defaults to
  `blake2b_headline=Totoro`; use the per-network action if the RC4 test
  announcement specifies a different exact headline.
- `signet` joins the public default signet. Its blocks additionally require an
  authorized signet block signature, so this BLAKE2b miner cannot mine public
  signet by itself.
- `regtest` starts a separate, ordinary local regtest at genesis without the
  dummy bootstrap or a public peer network.

Public modes perform a real Initial Block Download. They use pruning to limit
retained block data, but do not fake validation state. Each non-dummy mode has
its own datadir under `/data/networks`, so changing networks does not mix chain
state.

The node must be configured with the consensus headline. Public testnet4 mode
uses `Totoro`; dummy mode uses its original private `BIP110-LAB` value. The
node supplies the headline in `getblocktemplate` at the activation block, the
modified DATUM gateway inserts it into the coinbase, and the miner hashes the
resulting job.

The **Set BLAKE2b Headline** action stores a separate override for each network
and restarts the service when it is running. Input is limited to one printable
ASCII line to prevent generated-configuration injection. The setting must
exactly match the release candidate's announced consensus value; it is not a
miner branding field.

Supported StartOS architectures: x86_64 and aarch64.
