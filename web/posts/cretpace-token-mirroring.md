---
title: Token Mirroring
category: CrestPace
date: 2026-07-09
description: How CrestPace deploys mirrored tokens on BNB testnet and fetches real-world prices on-demand at the point of each transaction, using an event-driven architecture with a three-tier API fallback.
---

# Token Mirroring: Event-Driven Price Fetching

One of the first architectural problems I hit while designing CrestPace was price data. Every transaction, swap, stop-loss trigger, and interest calculation needs to know what a token is worth. The question was how to get that price reliably without adding unnecessary complexity on-chain.

## The constraint: contracts can't make external calls

Smart contracts are passive. They cannot reach out to an external API, fetch a price, and use it. Anything that needs external data has to be fed to the contract by an off-chain process.

This means the price has to be fetched off-chain, in the backend, at the moment it is needed. The architecture is event-driven: once a user makes a transaction request, the backend fetches the exact current price immediately and uses that for that particular transaction.

## The approach: mirrored tokens

CrestPace deploys its own versions of tokens on the BNB testnet. Each mirrored token represents a real-world cryptocurrency (BTC, ETH, USDC, etc.) and is used for actual transactions on the platform. These contracts handle transfers and balances, not price storage.

When a user initiates a transaction, the backend fetches the current price of the real-world token from an external API. The fetched price is used for that specific transaction: conversions, swaps, balance calculations, stop-loss triggers, and interest calculations all use the price fetched at the point of the request.

No price is written to the contract. No oracle is consulted on-chain. The fetch happens off-chain in the backend, and the result is applied to the transaction directly.

This means every transaction uses the real-world price at the moment it is executed, not a stale price written to a contract earlier.

## The trade-off

This is not a free lunch.

**Up-front complexity.** Deploying and maintaining mirrored tokens for every supported asset adds initial contract work. The price-fetching pipeline also needs to be built and hardened with fallbacks.

**Event-driven accuracy.** Because the price is fetched at the point of each transaction, the system always uses the most current price available. There is no risk of transacting against a stale on-chain price that was written minutes or hours ago.

**Price feeds remain an external dependency.** Every transaction depends on an external API call succeeding. The fallback system is what makes this reliable.

## Keeping the feed alive: the fallback system

Since every transaction depends on an external API call, downtime is a real risk. To prevent it, a three-tier fallback system is used.

The main option is a primary API with a very generous free tier. This allows fetching prices as many times as possible for free.

Fallbacks are essential in two cases:

1. **Quota exhaustion.** If the monthly limit on the first API is surpassed, the fallback APIs cover the remaining requests. The background cron job for regular price refreshes is designed so that it does not exhaust the monthly quota on its own.
2. **Event-driven capacity.** Whenever a user triggers a transaction, the system still needs to fetch prices. Enough request capacity must be left on the primary API for these event-driven requests, and the fallbacks absorb the overflow.

The redundancy works in sequence:

1. If the first API fails, the system moves to the second one.
2. In the unlikely scenario that the second API also fails, a third API serves as the backup.
3. Alternatively, if quotas on both the first and second APIs are exhausted due to high request volume, the third API covers the remaining amount needed before the end of the month.

## Why I chose this

Fetching the price at the point of each transaction means the system never transacts against stale data. The price a user sees is the price used for their transaction, fetched in real time. The fallback system ensures that the fetch itself never becomes a single point of failure. That combination is worth the extra engineering.
