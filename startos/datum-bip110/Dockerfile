FROM debian:bookworm-slim AS builder

ARG DATUM_COMMIT=56c31f40c83c3c8315694617082456677799e43a
ARG DATUM_TARBALL_SHA256=4f917f319137a28c37df7cdd0e12e86faa651d8c1892bbc8f04167d93a6e3128

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
        "https://github.com/justinfilip/datum_gateway/archive/${DATUM_COMMIT}.tar.gz" \
        --output /tmp/datum.tar.gz \
    && echo "${DATUM_TARBALL_SHA256}  /tmp/datum.tar.gz" | sha256sum --check --strict \
    && tar --extract --gzip --file /tmp/datum.tar.gz --strip-components=1 \
    && rm /tmp/datum.tar.gz

COPY browser-auth-compat.patch /tmp/browser-auth-compat.patch

RUN patch --directory=/src --strip=1 --input=/tmp/browser-auth-compat.patch \
    && rm /tmp/browser-auth-compat.patch

RUN cmake -S /src -B /build -DCMAKE_BUILD_TYPE=Release \
    && cmake --build /build --parallel

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
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
