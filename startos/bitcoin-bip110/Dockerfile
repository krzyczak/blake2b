FROM debian:bookworm-slim AS builder

ARG BITCOIN_COMMIT=afbe91c299e16519f03902939fdbda8af9bd527d
ARG BITCOIN_TARBALL_SHA256=2758d73bb5a0ec9d8dcf8b808dd738c83699f6da1f5b20825c900ef3646c076d

RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        ca-certificates \
        cmake \
        curl \
        libboost-dev \
        libevent-dev \
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
