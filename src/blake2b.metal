#include <metal_stdlib>
using namespace metal;

struct JobParams {
    ulong words[16];
    ulong start_nonce;
    ulong target[4];
    uint input_len;
    uint nonce_offset;
    uint nonce_size;
    uint nonce_little_endian;
    uint hash_little_endian;
    uint max_results;
    ulong sia_midstate[12];
};

constant uchar sigma[12][16] = {
    { 0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15},
    {14, 10,  4,  8,  9, 15, 13,  6,  1, 12,  0,  2, 11,  7,  5,  3},
    {11,  8, 12,  0,  5,  2, 15, 13, 10, 14,  3,  6,  7,  1,  9,  4},
    { 7,  9,  3,  1, 13, 12, 11, 14,  2,  6,  5, 10,  4,  0, 15,  8},
    { 9,  0,  5,  7,  2,  4, 10, 15, 14,  1, 11, 12,  6,  8,  3, 13},
    { 2, 12,  6, 10,  0, 11,  8,  3,  4, 13,  7,  5, 15, 14,  1,  9},
    {12,  5,  1, 15, 14, 13,  4, 10,  0,  7,  6,  3,  9,  2,  8, 11},
    {13, 11,  7, 14, 12,  1,  3,  9,  5,  0, 15,  4,  8,  6,  2, 10},
    { 6, 15, 14,  9, 11,  3,  0,  8, 12,  2, 13,  7,  1,  4, 10,  5},
    {10,  2,  8,  4,  7,  6,  1,  5, 15, 11,  9, 14,  3, 12, 13,  0},
    { 0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15},
    {14, 10,  4,  8,  9, 15, 13,  6,  1, 12,  0,  2, 11,  7,  5,  3},
};

template <uint shift>
inline ulong rotr64(ulong value) {
    return (value >> shift) | (value << (64 - shift));
}

inline ulong byte_swap(ulong value) {
    value = ((value & 0x00ff00ff00ff00ffUL) << 8) |
            ((value >> 8) & 0x00ff00ff00ff00ffUL);
    value = ((value & 0x0000ffff0000ffffUL) << 16) |
            ((value >> 16) & 0x0000ffff0000ffffUL);
    return (value << 32) | (value >> 32);
}

#define G(r, i, a, b, c, d)                         \
    a = a + b + m[sigma[r][2 * i]];                 \
    d = rotr64<32>(d ^ a);                           \
    c = c + d;                                       \
    b = rotr64<24>(b ^ c);                           \
    a = a + b + m[sigma[r][2 * i + 1]];             \
    d = rotr64<16>(d ^ a);                           \
    c = c + d;                                       \
    b = rotr64<63>(b ^ c)

#define ROUND(r)                                     \
    G(r, 0, v[0], v[4], v[8],  v[12]);              \
    G(r, 1, v[1], v[5], v[9],  v[13]);              \
    G(r, 2, v[2], v[6], v[10], v[14]);              \
    G(r, 3, v[3], v[7], v[11], v[15]);              \
    G(r, 4, v[0], v[5], v[10], v[15]);              \
    G(r, 5, v[1], v[6], v[11], v[12]);              \
    G(r, 6, v[2], v[7], v[8],  v[13]);              \
    G(r, 7, v[3], v[4], v[9],  v[14])

kernel void blake2b_mine(
    constant JobParams& job [[buffer(0)]],
    device atomic_uint* result_count [[buffer(1)]],
    device ulong* results [[buffer(2)]],
    uint gid [[thread_position_in_grid]]
) {
    const ulong nonce = job.start_nonce + ulong(gid);
    ulong m[16];
    for (uint i = 0; i < 16; ++i) {
        m[i] = job.words[i];
    }

    if (job.nonce_size == 8 && (job.nonce_offset & 7) == 0) {
        m[job.nonce_offset >> 3] = job.nonce_little_endian ? nonce : byte_swap(nonce);
    } else {
        for (uint i = 0; i < job.nonce_size; ++i) {
            const uint source_shift = job.nonce_little_endian
                ? i * 8
                : (job.nonce_size - 1 - i) * 8;
            const ulong byte_value = (nonce >> source_shift) & 0xffUL;
            const uint absolute = job.nonce_offset + i;
            const uint word = absolute >> 3;
            const uint shift = (absolute & 7) * 8;
            m[word] = (m[word] & ~(0xffUL << shift)) | (byte_value << shift);
        }
    }

    ulong v[16] = {
        0x6a09e667f2bdc928UL, 0xbb67ae8584caa73bUL,
        0x3c6ef372fe94f82bUL, 0xa54ff53a5f1d36f1UL,
        0x510e527fade682d1UL, 0x9b05688c2b3e6c1fUL,
        0x1f83d9abfb41bd6bUL, 0x5be0cd19137e2179UL,
        0x6a09e667f3bcc908UL, 0xbb67ae8584caa73bUL,
        0x3c6ef372fe94f82bUL, 0xa54ff53a5f1d36f1UL,
        0x510e527fade682d1UL ^ ulong(job.input_len),
        0x9b05688c2b3e6c1fUL, 0xe07c265404be4294UL,
        0x5be0cd19137e2179UL,
    };

    ROUND(0);
    ROUND(1);
    ROUND(2);
    ROUND(3);
    ROUND(4);
    ROUND(5);
    ROUND(6);
    ROUND(7);
    ROUND(8);
    ROUND(9);
    ROUND(10);
    ROUND(11);

    const ulong h0 = 0x6a09e667f2bdc928UL ^ v[0] ^ v[8];
    const ulong h1 = 0xbb67ae8584caa73bUL ^ v[1] ^ v[9];
    const ulong h2 = 0x3c6ef372fe94f82bUL ^ v[2] ^ v[10];
    const ulong h3 = 0xa54ff53a5f1d36f1UL ^ v[3] ^ v[11];
    ulong hash[4];
    if (job.hash_little_endian) {
        hash[0] = h3;
        hash[1] = h2;
        hash[2] = h1;
        hash[3] = h0;
    } else {
        hash[0] = byte_swap(h0);
        hash[1] = byte_swap(h1);
        hash[2] = byte_swap(h2);
        hash[3] = byte_swap(h3);
    }

    bool accepted = true;
    for (uint i = 0; i < 4; ++i) {
        if (hash[i] < job.target[i]) {
            break;
        }
        if (hash[i] > job.target[i]) {
            accepted = false;
            break;
        }
    }
    if (!accepted) {
        return;
    }

    const uint slot = atomic_fetch_add_explicit(result_count, 1u, memory_order_relaxed);
    if (slot < job.max_results) {
        results[slot] = nonce;
    }
}

#undef ROUND
#undef G

// The Sia/BIP110 profile always hashes one final 80-byte block, places an
// aligned little-endian nonce in message word 4, and compares the digest as a
// big-endian integer. Keeping every message and state word scalar avoids the
// dynamic array indexing and thread-local spills of the generic layout kernel.
#define U64X2(lo, hi) uint2(0x##lo##U, 0x##hi##U)

inline uint2 split_u64(ulong value) {
    return as_type<uint2>(value);
}

inline uint2 add_u64(uint2 left, uint2 right) {
    uint2 sum = left + right;
    sum.y += uint(sum.x < left.x);
    return sum;
}

inline uint2 xor_u64(uint2 left, uint2 right) {
    return left ^ right;
}

inline uint2 rotr32_u64(uint2 value) {
    return value.yx;
}

template <uint shift>
inline uint2 rotr_small_u64(uint2 value) {
    return uint2(
        (value.x >> shift) | (value.y << (32 - shift)),
        (value.y >> shift) | (value.x << (32 - shift))
    );
}

inline uint2 rotl1_u64(uint2 value) {
    return uint2((value.x << 1) | (value.y >> 31),
                 (value.y << 1) | (value.x >> 31));
}

#define GS(a, b, c, d, x, y)                        \
    a = add_u64(add_u64(a, b), x);                   \
    d = rotr32_u64(xor_u64(d, a));                  \
    c = add_u64(c, d);                              \
    b = rotr_small_u64<24>(xor_u64(b, c));          \
    a = add_u64(add_u64(a, b), y);                   \
    d = rotr_small_u64<16>(xor_u64(d, a));          \
    c = add_u64(c, d);                              \
    b = rotl1_u64(xor_u64(b, c))

#define RS0()                                       \
    GS(v0, v4, v8,  v12, m0,  m1);                 \
    GS(v1, v5, v9,  v13, m2,  m3);                 \
    GS(v2, v6, v10, v14, m4,  m5);                 \
    GS(v3, v7, v11, v15, m6,  m7);                 \
    GS(v0, v5, v10, v15, m8,  m9);                 \
    GS(v1, v6, v11, v12, m10, m11);                \
    GS(v2, v7, v8,  v13, m12, m13);                \
    GS(v3, v4, v9,  v14, m14, m15)

#define RS1()                                       \
    GS(v0, v4, v8,  v12, m14, m10);                \
    GS(v1, v5, v9,  v13, m4,  m8);                 \
    GS(v2, v6, v10, v14, m9,  m15);                \
    GS(v3, v7, v11, v15, m13, m6);                 \
    GS(v0, v5, v10, v15, m1,  m12);                \
    GS(v1, v6, v11, v12, m0,  m2);                 \
    GS(v2, v7, v8,  v13, m11, m7);                 \
    GS(v3, v4, v9,  v14, m5,  m3)

#define RS2()                                       \
    GS(v0, v4, v8,  v12, m11, m8);                 \
    GS(v1, v5, v9,  v13, m12, m0);                 \
    GS(v2, v6, v10, v14, m5,  m2);                 \
    GS(v3, v7, v11, v15, m15, m13);                \
    GS(v0, v5, v10, v15, m10, m14);                \
    GS(v1, v6, v11, v12, m3,  m6);                 \
    GS(v2, v7, v8,  v13, m7,  m1);                 \
    GS(v3, v4, v9,  v14, m9,  m4)

#define RS3()                                       \
    GS(v0, v4, v8,  v12, m7,  m9);                 \
    GS(v1, v5, v9,  v13, m3,  m1);                 \
    GS(v2, v6, v10, v14, m13, m12);                \
    GS(v3, v7, v11, v15, m11, m14);                \
    GS(v0, v5, v10, v15, m2,  m6);                 \
    GS(v1, v6, v11, v12, m5,  m10);                \
    GS(v2, v7, v8,  v13, m4,  m0);                 \
    GS(v3, v4, v9,  v14, m15, m8)

#define RS4()                                       \
    GS(v0, v4, v8,  v12, m9,  m0);                 \
    GS(v1, v5, v9,  v13, m5,  m7);                 \
    GS(v2, v6, v10, v14, m2,  m4);                 \
    GS(v3, v7, v11, v15, m10, m15);                \
    GS(v0, v5, v10, v15, m14, m1);                 \
    GS(v1, v6, v11, v12, m11, m12);                \
    GS(v2, v7, v8,  v13, m6,  m8);                 \
    GS(v3, v4, v9,  v14, m3,  m13)

#define RS5()                                       \
    GS(v0, v4, v8,  v12, m2,  m12);                \
    GS(v1, v5, v9,  v13, m6,  m10);                \
    GS(v2, v6, v10, v14, m0,  m11);                \
    GS(v3, v7, v11, v15, m8,  m3);                 \
    GS(v0, v5, v10, v15, m4,  m13);                \
    GS(v1, v6, v11, v12, m7,  m5);                 \
    GS(v2, v7, v8,  v13, m15, m14);                \
    GS(v3, v4, v9,  v14, m1,  m9)

#define RS6()                                       \
    GS(v0, v4, v8,  v12, m12, m5);                 \
    GS(v1, v5, v9,  v13, m1,  m15);                \
    GS(v2, v6, v10, v14, m14, m13);                \
    GS(v3, v7, v11, v15, m4,  m10);                \
    GS(v0, v5, v10, v15, m0,  m7);                 \
    GS(v1, v6, v11, v12, m6,  m3);                 \
    GS(v2, v7, v8,  v13, m9,  m2);                 \
    GS(v3, v4, v9,  v14, m8,  m11)

#define RS7()                                       \
    GS(v0, v4, v8,  v12, m13, m11);                \
    GS(v1, v5, v9,  v13, m7,  m14);                \
    GS(v2, v6, v10, v14, m12, m1);                 \
    GS(v3, v7, v11, v15, m3,  m9);                 \
    GS(v0, v5, v10, v15, m5,  m0);                 \
    GS(v1, v6, v11, v12, m15, m4);                 \
    GS(v2, v7, v8,  v13, m8,  m6);                 \
    GS(v3, v4, v9,  v14, m2,  m10)

#define RS8()                                       \
    GS(v0, v4, v8,  v12, m6,  m15);                \
    GS(v1, v5, v9,  v13, m14, m9);                 \
    GS(v2, v6, v10, v14, m11, m3);                 \
    GS(v3, v7, v11, v15, m0,  m8);                 \
    GS(v0, v5, v10, v15, m12, m2);                 \
    GS(v1, v6, v11, v12, m13, m7);                 \
    GS(v2, v7, v8,  v13, m1,  m4);                 \
    GS(v3, v4, v9,  v14, m10, m5)

#define RS9()                                       \
    GS(v0, v4, v8,  v12, m10, m2);                 \
    GS(v1, v5, v9,  v13, m8,  m4);                 \
    GS(v2, v6, v10, v14, m7,  m6);                 \
    GS(v3, v7, v11, v15, m1,  m5);                 \
    GS(v0, v5, v10, v15, m15, m11);                \
    GS(v1, v6, v11, v12, m9,  m14);                \
    GS(v2, v7, v8,  v13, m3,  m12);                \
    GS(v3, v4, v9,  v14, m13, m0)

#define m0 split_u64(job.words[0])
#define m1 split_u64(job.words[1])
#define m2 split_u64(job.words[2])
#define m3 split_u64(job.words[3])
#define m4 nonce
#define m5 split_u64(job.words[5])
#define m6 split_u64(job.words[6])
#define m7 split_u64(job.words[7])
#define m8 split_u64(job.words[8])
#define m9 split_u64(job.words[9])
#define m10 uint2(0)
#define m11 uint2(0)
#define m12 uint2(0)
#define m13 uint2(0)
#define m14 uint2(0)
#define m15 uint2(0)

kernel void blake2b_mine_sia(
    constant JobParams& job [[buffer(0)]],
    device atomic_uint* result_count [[buffer(1)]],
    device ulong* results [[buffer(2)]],
    uint gid [[thread_position_in_grid]]
) {
    const uint2 nonce = add_u64(split_u64(job.start_nonce), uint2(gid, 0));

    uint2 v0 = split_u64(job.sia_midstate[0]);
    uint2 v1 = split_u64(job.sia_midstate[4]);
    uint2 v2 = U64X2(fe94f82b, 3c6ef372);
    uint2 v3 = split_u64(job.sia_midstate[8]);
    uint2 v4 = split_u64(job.sia_midstate[1]);
    uint2 v5 = split_u64(job.sia_midstate[5]);
    uint2 v6 = U64X2(fb41bd6b, 1f83d9ab);
    uint2 v7 = split_u64(job.sia_midstate[9]);
    uint2 v8 = split_u64(job.sia_midstate[2]);
    uint2 v9 = split_u64(job.sia_midstate[6]);
    uint2 v10 = U64X2(fe94f82b, 3c6ef372);
    uint2 v11 = split_u64(job.sia_midstate[10]);
    uint2 v12 = split_u64(job.sia_midstate[3]);
    uint2 v13 = split_u64(job.sia_midstate[7]);
    uint2 v14 = U64X2(04be4294, e07c2654);
    uint2 v15 = split_u64(job.sia_midstate[11]);

    // The three nonce-independent column mixes of round zero were prepared on
    // the CPU when the job arrived. Only column 2 and the diagonal half remain.
    GS(v2, v6, v10, v14, m4,  m5);
    GS(v0, v5, v10, v15, m8,  m9);
    GS(v1, v6, v11, v12, m10, m11);
    GS(v2, v7, v8,  v13, m12, m13);
    GS(v3, v4, v9,  v14, m14, m15);
    RS1();
    RS2();
    RS3();
    RS4();
    RS5();
    RS6();
    RS7();
    RS8();
    RS9();
    RS0();
    RS1();

    // Compare the most-significant digest bytes first. Sia targets normally
    // start with zero bytes, so almost every lane exits after one byte instead
    // of byte-swapping and comparing the full 256-bit hash. A 32-bit prefix
    // tie is returned as a conservative candidate and verified on the CPU.
    const uint hash_prefix_le = xor_u64(
        U64X2(f2bdc928, 6a09e667), xor_u64(v0, v8)
    ).x;
    const uint target_prefix_be = split_u64(job.target[0]).y;
    uint hash_byte = hash_prefix_le & 0xffU;
    uint target_byte = target_prefix_be >> 24;
    if (hash_byte > target_byte) {
        return;
    }
    if (hash_byte == target_byte) {
        hash_byte = (hash_prefix_le >> 8) & 0xffU;
        target_byte = (target_prefix_be >> 16) & 0xffU;
        if (hash_byte > target_byte) {
            return;
        }
        if (hash_byte == target_byte) {
            hash_byte = (hash_prefix_le >> 16) & 0xffU;
            target_byte = (target_prefix_be >> 8) & 0xffU;
            if (hash_byte > target_byte) {
                return;
            }
            if (hash_byte == target_byte) {
                hash_byte = hash_prefix_le >> 24;
                target_byte = target_prefix_be & 0xffU;
                if (hash_byte > target_byte) {
                    return;
                }
            }
        }
    }

    const uint slot = atomic_fetch_add_explicit(result_count, 1u, memory_order_relaxed);
    if (slot < job.max_results) {
        results[slot] = as_type<ulong>(nonce);
    }
}

#undef m15
#undef m14
#undef m13
#undef m12
#undef m11
#undef m10
#undef m9
#undef m8
#undef m7
#undef m6
#undef m5
#undef m4
#undef m3
#undef m2
#undef m1
#undef m0
#undef RS9
#undef RS8
#undef RS7
#undef RS6
#undef RS5
#undef RS4
#undef RS3
#undef RS2
#undef RS1
#undef RS0
#undef GS
#undef U64X2
