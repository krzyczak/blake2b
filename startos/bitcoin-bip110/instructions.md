# Bitcoin Knots BIP110

This experimental package runs Bitcoin Knots
`v29.4.1.knots20260508rc3`. Open **Actions → Select Network** to choose the
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

After selecting a network, **Actions → Set BLAKE2b Headline** shows its current
value and lets you store a separate override for that network. The package
defaults to `Totoro` on testnet4 and `BIP110-LAB` in dummy mode. Change it only
when the Knots RC3 test announcement publishes a different exact value: the
setting is consensus-critical at the BLAKE2b activation block.

Each mode keeps separate chain data. Public networks use a pruned, fully
validated IBD; there is no safe fake-IBD shortcut for producing blocks that
public peers will accept.

The package writes the selected network's headline into `bitcoin.conf`. At the
activation block the node passes it through `getblocktemplate`, DATUM adds it
to the coinbase, and the miner receives the finished BIP110 job. It is a node
setting, not the explorer-visible mining identity and not a miner command-line
option.

To mine against this node, install and start DATUM BIP110 Gateway and connect
the Apple miner to its Stratum interface using `--sia`. The node itself does
not speak Stratum; the gateway translates RPC block templates into the
Sia-style BLAKE2b jobs accepted by that mode. `--datum` is only for the older
Maveth precomputed-mid lab dialect.

The built-in DATUM payout address is disposable and has no wallet in this
package. Testnet and regtest coins have no monetary value.
