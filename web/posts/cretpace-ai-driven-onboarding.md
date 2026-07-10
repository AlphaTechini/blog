---
title: AI-Driven Onboarding and Fund Allocation
category: CrestPace
date: 2026-07-09
description: How CrestPace uses salary data from a user's role and city to produce realistic deposit amounts, then lets the user choose a percentage of that salary and allocate across tokens by percentage, mimicking a real bank onboarding.
---

# AI-Driven Onboarding and Fund Allocation

CrestPace avoids on-ramping real currencies and stays off mainnets during early phases. Instead of requiring users to deposit real funds, an allocation method is used to seed each user's balance. The goal is to make the experience as realistic as possible without touching real money.

## The flow

After completing the KYC flow (liveness check and government ID match), the user provides employment details: industry, exact role, and the city they work from. The system performs a web search to determine the average salary for that specific role in that specific geographic area.

The user then chooses a percentage of that salary to use as their deposit amount. This ensures each user starts with a balance that reflects real-world earning data rather than an arbitrary fixed number, while still giving the user control over how much of their salary they want to allocate.

## Token selection

The user selects which tokens to allocate their deposit to and defines the percentage each token should receive. For example, a user with a $5,000 deposit might allocate 60% to USDC, 30% to ETH, and 10% to BTC. The system distributes the deposit across the chosen tokens according to the user's specified percentages.

We will start with 10 tokens, offering a mix of variety and ease of deploying and development. Though the architecture will be such that we can easily allow usage of up to 100 tokens without hiccups. If no token is selected, it will default to USDC. These 10 tokens also help for the architecture I designed for the swap logic.

## Why this design

- **No real on-ramp, no mainnet risk.** Early development and testing happen entirely on testnets with testnet tokens. There is zero financial liability.
- **Realistic starting balances.** The salary lookup produces deposit amounts that feel authentic. A software engineer in San Francisco and a teacher in Nairobi will receive materially different starting balances, which mirrors how the platform would behave in production.
- **User agency over deposit size.** Letting the user choose a percentage of their salary rather than forcing the full amount respects their preferences and mirrors real life, where you decide how much of your pay to deposit in your bank.
- **User agency over token mix.** Pushing all deposits into a single default token would force users into an allocation they did not choose. Letting the user define percentages up front respects their preferences and educates them about multi-token portfolio construction from day one.
- **Built in-house.** The scheduling engine for recurring allowances and the bulk transfer processor handle the disbursement of these allocated funds without external payment services, consistent with the principle of minimal external dependencies.
