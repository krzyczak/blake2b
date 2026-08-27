# StartOS packages

This directory contains three StartOS SDK 2.0 packages:

- `bitcoin-bip110`: Bitcoin Knots RC3 with selectable dummy, testnet4,
  signet, and regtest modes.
- `datum-bip110`: Maveth's matching BLAKE2b DATUM gateway.
- `mempool-guide`: the x86_64 mempool.guide/Retropex explorer, packaged under
  a separate service id so it can coexist with Start9's official Mempool.

The Bitcoin and DATUM packages are a pair and support x86_64 and aarch64. The
Mempool Guide package is independent and currently targets x86_64 only. All
three packages pin immutable source commits and verify source tarball hashes.

They use Start SDK 2.0.9 and target StartOS 0.4.0-beta.10. A server still on
the 0.3.5 generation must be upgraded before it can sideload these packages.

## Network modes

The Bitcoin package does not fake synchronization or bypass block validation.
Its default dummy mode has no peers and uses Bitcoin's own RPC to mine and
validate heights 1 through 19, stopping before `blake2b@20`. Testnet4 and
signet perform a real, pruned IBD; ordinary regtest starts at genesis and has
no canonical public peers. The four modes keep separate chain data.

## Build remotely with GitHub Actions

The repository workflow `.github/workflows/startos-packages.yml` builds all
installable artifacts on GitHub-hosted runners, including Mempool Guide for
x86_64.

- Bitcoin Knots BIP110 for x86_64 and aarch64
- DATUM BIP110 Gateway for x86_64 and aarch64
- Mempool Guide for x86_64

Push this repository to GitHub, open **Actions**, select **Build StartOS
Packages**, and choose **Run workflow**. Download the artifact for the package
you want. You do not need Docker, CMake, or a C++ toolchain on the Mac.

The workflow uses an ephemeral signing key because these are experimental
sideload packages. It does not publish them to a registry.

## Install and run

1. Sideload and start the matching `bitcoin-bip110` package.
2. Use **Actions → Select Network**, then wait for the node's health check to
   turn green. Testnet4 and signet must synchronize first.
3. Sideload and start the matching `datum-bip110` package. StartOS installs the
   declared Bitcoin dependency and wires RPC over its internal bridge.
4. In DATUM BIP110 Gateway's Interfaces page, copy the BIP110 Stratum address.
5. On the Apple Silicon Mac, run:

   ```sh
   target/release/blake2b-apple-miner \
     --sia \
     --device both \
     --startum-url='stratum+tcp://ADDRESS_SHOWN_BY_STARTOS' \
     --username=local.worker \
     --password=x
   ```

The intentionally misspelled `--startum-url` is supported as an alias; the
correct `--stratum-url` spelling works too.

## Mining configuration

The packages regenerate these settings at every start:

- Network: selected in the Bitcoin package action.
- Dummy activation: BLAKE2b at height 20 with headline `BIP110-LAB`.
- Public testnet4: RC3's built-in activation at height 150027 with real peer
  synchronization. The package defaults its headline to `Totoro`; the node's
  **Set BLAKE2b Headline** action can override this separately for each network
  when the RC3 test announcement specifies a different exact value.
- Bitcoin RPC: port 18443, bridge-only on StartOS.
- Gateway Stratum: raw TCP port 23334 (StartOS may assign another external
  port if it is already occupied).
- Minimum share difficulty: 1.
- External DATUM pool: disabled.
- Payout: disposable testnet/regtest Base58 address with no packaged wallet.

DATUM's **Set Mining Identity** action controls the two on-chain coinbase tags.
These are the strings an explorer can match to a miner name; the Knots
headline is a separate consensus value. Public explorers still need a pool
registry entry for the tag before they show a named pickaxe label.

The node does not speak Stratum. The companion gateway translates Knots RPC
and BIP22 templates into Sia-style BLAKE2b Stratum, so use the miner's `--sia`
mode. `--datum` remains a compatibility mode for Maveth's opt-in
precomputed-mid lab dialect; it is not used by the StartOS gateway package.

These are deliberately not mainnet packages. The upstream revisions are
pinned by immutable commit and verified tarball hash; update both values
together when testing a newer protocol revision.
