FROM debian:bookworm-slim AS builder

ARG DATUM_COMMIT=7491a5099dd5d887a027c812f71de63e0d5986a3
ARG DATUM_TARBALL_SHA256=453b8dfc06f805b275eb99e745cb9df23ac6ff9a3b9e76a41926169f129b8b9d

RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        ca-certificates \
        cmake \
        curl \
        libcurl4-openssl-dev \
        libjansson-dev \
        libmicrohttpd-dev \
        libsodium-dev \
        patch \
        pkgconf \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /src

RUN curl --fail --location --silent --show-error \
        "https://github.com/Maveth/datum_gateway/archive/${DATUM_COMMIT}.tar.gz" \
        --output /tmp/datum.tar.gz \
    && echo "${DATUM_TARBALL_SHA256}  /tmp/datum.tar.gz" | sha256sum --check --strict \
    && tar --extract --gzip --file /tmp/datum.tar.gz --strip-components=1 \
    && rm /tmp/datum.tar.gz

COPY browser-auth-compat.patch /tmp/browser-auth-compat.patch
COPY best-share.patch /tmp/best-share.patch
COPY configured-payout-address.patch /tmp/configured-payout-address.patch
COPY lab-compat.patch /tmp/lab-compat.patch
COPY dashboard/home.html /src/www/home.html

RUN patch --fuzz=0 --directory=/src --strip=1 --input=/tmp/browser-auth-compat.patch \
    && patch --fuzz=0 --directory=/src --strip=1 --input=/tmp/best-share.patch \
    && patch --fuzz=0 --directory=/src --strip=1 --input=/tmp/configured-payout-address.patch \
    && patch --fuzz=0 --directory=/src --strip=1 --input=/tmp/lab-compat.patch \
    && rm /tmp/browser-auth-compat.patch /tmp/best-share.patch \
        /tmp/configured-payout-address.patch /tmp/lab-compat.patch

RUN cmake -S /src -B /build -DCMAKE_BUILD_TYPE=Release \
    && cmake --build /build --parallel \
    && /build/datum_gateway --test

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
        jq \
        libcurl4 \
        libjansson4 \
        libmicrohttpd12 \
        libsodium23 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /build/datum_gateway /app/datum_gateway
COPY --from=builder /src/www /app/www
COPY docker-entrypoint.sh /usr/local/bin/datum-bip110-entrypoint

RUN chmod 0755 /usr/local/bin/datum-bip110-entrypoint

EXPOSE 23334/tcp 7152/tcp

ENTRYPOINT ["/usr/local/bin/datum-bip110-entrypoint"]
