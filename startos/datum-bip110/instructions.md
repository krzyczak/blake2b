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

Open the **Monitoring Dashboard** interface for DATUM status, estimated
hashrate, accepted and rejected shares, connected clients, and the current
Stratum job. The status page is read-only. Protected detail pages use HTTP
digest authentication; retrieve the generated `admin` credentials from
**Actions → Dashboard Credentials**. Dashboard configuration editing remains
disabled because StartOS owns the service configuration.

Protected pages use browser-compatible MD5 HTTP Digest authentication. Open
them only through the HTTPS interface published by StartOS; do not expose the
dashboard's internal port 7152 directly to an untrusted network.

Use **Actions → Set Mining Identity** to change the primary and secondary
coinbase tags. For example, set the primary tag to `/MyMiner/` and the
secondary tag to `Totoro`. The gateway restarts and embeds those strings in
new solo-mined coinbase transactions. This is independent of the Knots
`blake2b_headline` consensus setting.

Use **Actions → Set Solo Payout Address** to replace the disposable default
address with an address whose private key you control. For Testnet4 use a
Testnet address, normally beginning with `m`, `n`, `2`, or `tb1`. DATUM's
dashboard currently renders output scripts with Mainnet address prefixes, so
the Coinbaser page may show a corresponding `1`, `3`, or `bc1` address even
though the underlying Testnet4 payout script is correct.

Mempool explorers identify miners by matching coinbase tags or payout
addresses against their own pool registry. Your tag will be visible in the raw
coinbase immediately, but a public site will show your chosen display name and
pickaxe only after its operator adds a matching registry entry. Ask the
mempool.guide operator to map your exact unique tag to your desired name.

The gateway uses minimum share difficulty 1, automatically follows the node's
`!blake2b` template rule, and disables connection to an external DATUM pool.
Its initial payout address is disposable and must be replaced to control mined
rewards. Its default tags are `Totoro` and `StartOS-BIP110`. In dummy mode, a
submitted height-20 block belongs to the private regtest chain.
In testnet4 mode, an accepted block belongs to the public chain and can be
viewed at `https://mempool.guide/testnet4`. The payout key is not included in
this package and test coins have no monetary value.

`--datum` is retained in the Apple miner only for the older Maveth lab-mid
dialect. Justin Filip's current gateway sends canonical Sia-style jobs, so use
`--sia` with this StartOS package.
