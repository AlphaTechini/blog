---
title: Token Mirroring
category: CrestPace
date: 2026-07-09
description: How CrestPace deploys mirrored tokens on BNB testnet that carry real-world prices directly on-chain, removing the need for an oracle call on every transaction.
---

# Token Mirroring: On-Chain Prices Without an Oracle

One of the first architectural problems I hit while designing CrestPace was price data. Every transaction, swap, stop-loss trigger, and interest calculation needs to know what a token is worth. The default answer is "call a price API" or "read from an oracle contract." I did not want to do that on every single transaction.

## The problem with external price feeds

If the backend reads a price from one API and the on-chain logic reads from another, they can disagree. Not because either is wrong, but because they queried at slightly different times and the market moved between those two calls. That mismatch is a bug source that scales with the number of price-dependent operations.

There is also the latency problem. Reading an external API or calling an oracle contract from within a transaction adds a round trip. For a platform whose name is built on speed, that is a bad trade.

## The approach: mirrored tokens

Instead of consulting an external feed at the point of every transaction, CrestPace deploys its own versions of tokens on the BNB testnet. Each mirrored token tracks the live price of its real-world counterpart and carries that price on-chain.

When the price of the real-world token changes, it reflects on the mirrored token.

This means every transaction on the platform uses prices that exist directly on-chain with the tokens themselves. The mirrored tokens behave as though they have a built-in reserve price, removing the need to consult an external price feed at the point of every transaction.

### How it works

- A mirrored USDC, ETH, BTC, or any other supported token is deployed as a smart contract on BNB testnet.
- Each contract holds a price field that is updated by an off-chain price feed service. The feed polls external APIs and writes the current price to the contract when a change is detected.
- Transfers, swaps, and balance calculations read the price directly from the token contract, not from a separate oracle contract or an API call.
- The price is always available on-chain, so any on-chain logic that needs it (a swap contract, a stop-loss trigger, an interest calculation) can access it without an additional external call.

## The trade-off

This is not a free lunch.

**Up-front complexity.** Deploying and maintaining mirrored tokens for every supported asset adds initial contract work and an ongoing price-feed pipeline. This is more setup than simply calling a price API from the backend.

**Long-term simplicity.** Once deployed, all on-chain components (contracts, listeners, the backend ledger) read from a single authoritative source. There is no risk of the backend and on-chain logic disagreeing on the current price because they queried different APIs at slightly different times.

**Price feeds remain an external dependency.** The mirrored token still relies on an off-chain service to write prices. The point is not to eliminate the feed, but to consolidate it into one pipeline that feeds all downstream consumers.

## Keeping the feed alive: the fallback system

Since the off-chain price feed depends on external APIs, downtime is a real risk. To prevent it, a three-tier fallback system is used.

The main option is a primary API with a very generous free tier. This allows fetching prices as many times as possible for free.

Fallbacks are essential in two cases:

1. **Quota exhaustion.** If the monthly limit on the first API is surpassed, the fallback APIs cover the remaining requests. The background cron job for regular price refreshes is designed so that it does not exhaust the monthly quota on its own.
2. **Event-driven capacity.** Whenever a user triggers a transaction, the system still needs to fetch prices and update the tokens. Enough request capacity must be left on the primary API for these event-driven requests, and the fallbacks absorb the overflow.

The redundancy works in sequence:

1. If the first API fails, the system moves to the second one.
2. In the unlikely scenario that the second API also fails, a third API serves as the backup.
3. Alternatively, if quotas on both the first and second APIs are exhausted due to high request volume, the third API covers the remaining amount needed before the end of the month.

## Why I chose this

The consolidation is the real win. One pipeline writes prices. Everything else reads from the token contract. The system becomes simpler to reason about because there is exactly one place where prices enter the chain, and every consumer downstream reads the same value. That is worth the extra contract work up front.
