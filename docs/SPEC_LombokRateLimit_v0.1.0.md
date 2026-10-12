# SPEC LombokRateLimit v0.1.0

This document is the normative cross-language contract. Every language port MUST produce byte-identical output for all specified inputs. Deviations from this specification are bugs.

The keywords MUST, SHOULD and MAY are to be read as in RFC 2119. Last reviewed: 2026-10-07.

## 0. Reference standards

This library defines its own contract; there is no normative external standard except those named in the relevant sections.

## 1. Vectors

| File | Cases | SHA-256 |
|---|---|---|
| `vectors/lombokratelimit-vectors-v1.json` | 2239 | `d7ce95312decf2f3167fc45938eb5233bbc223eea1cb5882dcbb191a44f93b01` |

## 2. Contract

1. The internal unit is ms multiplied by limit. T = periodMs and capacity = burst*T. For a request of size cost: next = max(tat, now) + cost*T; the request is allowed if next - now <= capacity; if allowed, tat = next.
2. remaining = floor((capacity - max(tat - now, 0)) / T) after the decision. resetAfterMs = ceil(max(tat - now, 0) / limit).
3. retryAfterMs = 0 if allowed; -1 if cost > burst; otherwise ceil((next - now - capacity) / limit).
4. Input constraints: limit 1..1000000; periodMs and burst 1..2^31; nowMs an integer >= 0 with nowMs*limit < 2^53; cost 0..2^31. Violations raise RangeError/ValueError.
5. Time MUST NOT go backwards for a single limiter; behavior is undefined otherwise.
6. KeyedLimiter: a new key when the table is full triggers a sweep; if still full the decision is {allowed = (overflow == allow), remaining 0, retryAfterMs 0, resetAfterMs 0} and no key is created. sweep removes keys with tat <= now and returns the count.

## 3. Cross-language representation

String indexes and lengths are counted in code points; floating-point numbers use IEEE 754 doubles with the order of operations as written; large integers MUST NOT lose precision.

## 4. Non-goals

Distributed limiting, storage outside memory, and a monotonic clock are the caller's responsibility.

## 5. Contract change history

- 0.1.0: initial contract.
