# Backend, Cloud, and the Internals

Why I keep pulling at the threads beneath the abstractions.

Surface-level knowledge does not survive contact with production. A load balancer is not a box you tick, it is a decision about timeouts, retries, session affinity, and failure domains. A database is not a place you put data, it is a set of tradeoffs around consistency, durability, and latency.

## The gap between tutorials and reality

Most tutorials stop at "it works on my machine." The interesting questions start after that:

- What happens when a node dies?
- What happens when a dependency returns garbage?
- What happens when traffic doubles in an hour?

## What I am focusing on

Golang for systems work, Rust where memory and predictability matter, and the cloud platforms that run them. Postgres when the data matters. The internals of consensus, replication, and scheduling.

The abstractions are useful. Understanding what they hide is better.
