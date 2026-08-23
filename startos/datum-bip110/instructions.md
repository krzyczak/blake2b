# DATUM BIP110 Gateway

This experimental service requires Bitcoin Knots BIP110. Select the desired
network in the node package and wait for its health check to become ready.
StartOS wires the RPC connection automatically.

Open the service's Interfaces page and copy the BIP110 Stratum address. On the
Mac that runs the miner, use:

```sh
target/release/blake2b-apple-miner \
  --sia \
  --device both \
  --startum-url=stratum+tcp://STARTOS_ADDRESS:23334 \
  --username=local.worker \
  --password=x
```

Replace the example address with the exact non-SSL address StartOS displays;
the external port may differ when port 23334 is already allocated.

The gateway uses minimum share difficulty 1, automatically follows the node's
`!blake2b` template rule, disables connection to an external DATUM pool, tags
its coinbase with `Totoro`, and pays a disposable testnet/regtest address. In
dummy mode, a submitted height-20 block belongs to the private regtest chain.
In testnet4 mode, an accepted block belongs to the public chain and can be
viewed at `https://mempool.guide/testnet4`. The payout key is not included in
this package and test coins have no monetary value.

`--datum` is retained in the Apple miner only for the older Maveth lab-mid
dialect. Justin Filip's current gateway sends canonical Sia-style jobs, so use
`--sia` with this StartOS package.
