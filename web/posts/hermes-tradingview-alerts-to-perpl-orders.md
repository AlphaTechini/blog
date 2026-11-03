---
title: Hermes: Turning TradingView Alerts Into Perpl Orders
description: How Hermes takes a TradingView webhook, checks it against risk limits, places the order on Perpl and never double-fills.
category: Projects
date: 2026-11-03
---

## Why

Many traders build their strategies and alerts on TradingView. When an alert fires, they still have to open Perpl, an on-chain perpetuals exchange on Monad, and place the trade by hand. If they're asleep, busy or offline, they miss it or enter late at a worse price.

Bybit and Bitget already let a TradingView alert place a futures order by itself, and OKX has a TradingView signal bot. I couldn't find anything like that for Perpl.

Traders also rarely see whether the live result matched the chart: how much price they lost between the alert and the fill, how long it took, and which alerts never became trades. Hermes is for a trader who already uses TradingView alerts and wants them executed on Perpl automatically, with hard safety limits, without writing a bot.

## How

### Receiving the alert

Each strategy gets its own webhook URL and secret, and the trader points their TradingView alert at it. TradingView cancels a request after 3 seconds, so Hermes stores the alert first, replies `202` straight away and does the rest asynchronously.

### Checking it

The secret is compared in constant time against an AES-256-GCM encrypted copy, and every kind of authentication failure gets the same `401`. A tolerant zod schema accepts TradingView's quirks, like numbers sent as strings and tickers such as `BINANCE:BTCUSDT.P`. An alert with the same `id` on the same strategy within 24 hours is treated as a duplicate and never reaches Perpl.

### Risk limits and approvals

A risk function checks the order against the trader's limits: allowed markets, max position size, max leverage, a daily loss stop, alert age, orders per minute and a pause switch. The first failing rule blocks the alert with a reason code. Closing orders always go through, so limits can't trap a trader in a position. Large orders wait for the trader's approval, 120 seconds by default.

### Placing the order on Perpl

Hermes sends a market order with a slippage cap over Perpl's trading WebSocket, signed with the trader's trade-only Ed25519 API key, which can't withdraw funds. It then follows the order through Perpl's messages until the fill arrives with its Monad transaction hash. Every step writes a timestamped row, so alert-to-fill time is measured, not estimated.

### Setting up the account

Signing in with email through Privy creates an embedded Monad testnet wallet. The trader adds the Hermes server as a restricted signer on that wallet in one prompt, and that signer can then send the setup transactions: getting test AUSD from the faucet, approving it to the Perpl exchange, creating the Perpl account and allowing order forwarding. A demo on the wallet page sends a transaction the policy must refuse, so you can watch Privy deny it.

### The report card

For each strategy, the report card shows slippage between alert and fill price, median and p95 alert-to-fill time, fill rate, realised PnL including slippage and fees, and every blocked or missed alert grouped by reason. It also gives a 0 to 100 grade from a published formula: fill rate 40, slippage 35, speed 25.

### What has actually run live

One short live run on 14 October 2026, against Perpl's testnet from Cloud Run in Europe, produced 4 fills with a median alert-to-fill time of 989 ms (p95 1.11 s) and a median slippage of 0.7 bps. The repo's notes say those alerts came from the app's "Send test alert" button, which posts the same message TradingView would send to the same webhook. Four fills is a small sample. Most tests run against a built-in Perpl simulator, and the screenshots in the repo are design renders with sample data.

The scope is deliberately narrow: market orders only, no limit or stop orders, no Pine Script and no mainnet. If TradingView fails to deliver an alert, Hermes never sees it.

## Technologies

- TypeScript on Node.js 22
- Fastify, SQLite, zod, viem
- React, Vite, Tailwind CSS v4, TanStack Query
- Privy (embedded wallets, server signer, policies)
- Perpl API on Monad testnet
- Google Cloud Run
- Vitest

## Architectural decisions

### Store first, execute later

TradingView gives up on a webhook after 3 seconds, and placing and tracking an order can take longer. So the receiver saves the alert, answers immediately, and the pipeline runs afterwards. Every alert has a record even if a later step fails, and the trader sees the outcome in Hermes rather than in TradingView.

### An order state machine that never double-fills

Each Perpl order carries a request id that only goes up per account, saved before the message is sent. Retries reuse the same id until a status comes back, and use a new one only after a failure or an expired block window. If the outcome is unclear, Hermes checks Perpl's REST API instead of re-sending, so a disconnect can't cause a second fill. Every branch of that logic is tested against injected faults like dropped statuses and disconnects.

### Risk as a pure function

The risk check takes the order, the limits and the current state, and returns a decision without touching the database or network. The same code runs in production and in tests, and every block comes with a clear reason code.

### A server signer boxed in by policy

Asking the trader to sign every setup transaction is tedious, but open signing power over their wallet is risky. Privy policies are default-deny, so the Hermes signer is limited to Monad testnet, zero native value, three contracts (with an approval cap) and an expiry time. The trader can remove the signer at any time. The cost is an extra setup step and a one-time bootstrap of the policy.

### A protocol simulator for offline testing

Perpl wasn't reachable from the build environment, so the Perpl package includes a simulator: a real WebSocket and HTTP server speaking the same messages, heartbeats and rate limits, with fault injection. That lets the whole stack run in tests without network access. Its synthetic prices say nothing about live slippage or latency, so only the live run counts for those numbers.
