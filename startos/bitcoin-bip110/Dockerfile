FROM debian:bookworm-slim AS builder

ARG BITCOIN_COMMIT=306523a567d5cf17d1939dc485be57a5ae83cfe7
ARG BITCOIN_TARBALL_SHA256=887216b39ef40c2b3c003ae0b7fde625174258d9e517ec0fa49775aacb82179f

RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        ca-certificates \
        cmake \
        curl \
        libboost-dev \
        libevent-dev \
        patch \
        pkgconf \
        python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /src

RUN curl --fail --location --silent --show-error \
        "https://github.com/bitcoinknots/bitcoin/archive/${BITCOIN_COMMIT}.tar.gz" \
        --output /tmp/bitcoin.tar.gz \
    && echo "${BITCOIN_TARBALL_SHA256}  /tmp/bitcoin.tar.gz" | sha256sum --check --strict \
    && tar --extract --gzip --file /tmp/bitcoin.tar.gz --strip-components=1 \
    && rm /tmp/bitcoin.tar.gz

# RC5 stopped exposing the activation headline through getblocktemplate.
# The companion DATUM build still consumes that field for the dummy chain's
# height-20 activation block, so restore only the RPC field. Consensus remains
# RC5's implementation and parameters.
COPY patches/restore-blake2b-headline-gbt.patch /tmp/
RUN patch --directory=/src --strip=1 \
        < /tmp/restore-blake2b-headline-gbt.patch \
    && rm /tmp/restore-blake2b-headline-gbt.patch

# Keep this bounded: an unqualified `--parallel` starts hundreds of cc1plus
# processes and makes GitHub's hosted runners thrash instead of completing.
RUN cmake -S /src -B /build \
        -DCMAKE_BUILD_TYPE=Release \
        -DCMAKE_CXX_FLAGS_RELEASE="-O3 -DNDEBUG -g0" \
        -DBUILD_BENCH=OFF \
        -DBUILD_GUI=OFF \
        -DBUILD_TESTS=OFF \
        -DENABLE_EXTERNAL_SIGNER=OFF \
        -DENABLE_TOR_SUBPROCESS=OFF \
        -DENABLE_WALLET=OFF \
        -DWITH_BDB=OFF \
        -DWITH_ZMQ=OFF \
    && cmake --build /build --parallel 2 --target bitcoind bitcoin-cli

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
        libevent-core-2.1-7 \
        libevent-extra-2.1-7 \
        libevent-pthreads-2.1-7 \
    && rm -rf /var/lib/apt/lists/*

ENV PATH=/opt/bitcoin/bin:$PATH

COPY --from=builder /build/bin/bitcoind /opt/bitcoin/bin/bitcoind
COPY --from=builder /build/bin/bitcoin-cli /opt/bitcoin/bin/bitcoin-cli
COPY docker-entrypoint.sh /usr/local/bin/bitcoin-bip110-entrypoint

RUN chmod 0755 /usr/local/bin/bitcoin-bip110-entrypoint \
    && bitcoind --version \
    && bitcoin-cli --version

EXPOSE 18443/tcp

ENTRYPOINT ["/usr/local/bin/bitcoin-bip110-entrypoint"]
