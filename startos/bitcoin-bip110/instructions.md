# Bitcoin Blake2b Lab

This experimental package runs Bitcoin Knots
`v29.4.1.knots20260508rc5`. Open **Actions → Select Network** to choose the
chain:

- **Isolated dummy regtest** is the default and preserves the original lab.
  It validates 19 local SHA256d blocks and leaves BLAKE2b height 20 for the
  miner. It has no peers or IBD.
- **Testnet4** connects to and validates the real public testnet4 chain. Wait
  for the health check to finish synchronizing before starting DATUM. A valid
  block accepted here can be found at `https://mempool.guide/testnet4`.
- **Signet** synchronizes the public default signet. Public signet mining also
  requires its authorized block signature and is not supported by this miner.
- **Regtest** creates a separate, unbootstrapped local regtest. Regtest has no
  canonical public network to synchronize with.

In dummy mode, **Actions → Set BLAKE2b Headline** changes the regtest-only
activation headline. The default is `BIP110-LAB`. RC5 permits this override
only with an explicit regtest activation height, so the action is hidden in
testnet4, signet, and ordinary regtest.

Each mode keeps separate chain data. Public networks use a pruned, fully
validated IBD; there is no safe fake-IBD shortcut for producing blocks that
public peers will accept.

For dummy mode, the package writes the headline into `bitcoin.conf`. A narrow
RPC compatibility patch passes it through `getblocktemplate` at height 20,
DATUM adds it to the coinbase, and the miner receives the finished BIP110 job.
It is not the explorer-visible mining identity or a miner command-line option.

To mine against this node, install and start DATUM Blake2b Lab and connect
the Apple miner to its Stratum interface using `--sia`. The node itself does
not speak Stratum; the gateway translates RPC block templates into the
Sia-style BLAKE2b jobs accepted by that mode. `--datum` is only for the older
Maveth precomputed-mid lab dialect.

The built-in DATUM payout address is disposable and has no wallet in this
package. Testnet and regtest coins have no monetary value.
