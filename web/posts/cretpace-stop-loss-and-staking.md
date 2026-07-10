---
title: Stop Loss and Fixed-Term Staking
category: CrestPace
date: 2026-07-09
description: How CrestPace ties stop losses to fixed-term staking, the monthly fee model, refund policy, and why daily interest accrual replaced the old lump-sum approach.
---

# Stop Loss and Fixed-Term Staking

Stop losses were a feature that I wanted to implement since the beginning planning phases of the project. However, locking funds was not. The two ended up tied together, and the reasoning went through several iterations before it settled.

## The original savings model

We planned to allow users to create a savings account and set the period they want to save it for, then get the interest after the time has been reached. We also planned to allow the user to unlock the funds either for full withdrawal or partial withdrawal.

The architecture we discussed then was to invalidate the interest on full withdrawal before deadline. Then for partial, pay based on what's left since in the end what was left was still part of the previous whole, so it should be a bit fair.

## The daily accrual pivot

But now I decided we will calculate how much the user gained each day for the amount deposited. So that, on full withdrawal, the user is getting the principal + interest that was already being added daily instead of just: "If the money stayed there for up to 30 days, then add this amount."

Now this architecture fails when the user triggers partial withdrawal. Reason: we can't keep giving the same interest when the amount saved (principal) is lower, since we kept auto-adding the interest then we will need to recalculate the interest with the new balance.

This architecture is also simple cos we don't need any complex logic for partial withdrawals.

Reminds me that legacy systems exist for a reason. No need to reinvent the wheel every time. Sure, maybe we would have come up with an amazing new algorithm that only worked for niche use cases. But this is just more efficient and effective.

## How stop loss tied into locking funds

When I came up with my swap feature algo, it had some problems and in a bid to get solutions I thought of this: Locking parts of user funds as a requirement to activate the stop loss setting, which converts all your tokens to stablecoins during a market crash.

This by the way brings another problem which of course is a bit easy to solve by ensuring supply is available.

## The monthly fee and refund policy

So basically users have to deposit a part of the funds every month (non-recoverable). But I guess since we want to have the customers at heart, we will refund it if they can prove they incurred losses despite our stop loss mechanism. But only the amount for that month will be refunded.

The user can choose to opt out. That way we don't charge for the stop loss feature. Failure to opt out, then the monthly billing continues.

This is one of the features that will be tested to ensure correctness and handle possible failures.

## Fixed-term staking as a separate product

The staking model is built around three rules:

1. **Fixed term.** The initial term is 30 days. Shorter or longer terms may be added later based on demand, but there is no variable-duration logic in Phase 1.
2. **Fixed reward rate.** For every 30-day period, the current placeholder rate is 2%. This figure is not final. Market research will be conducted later to determine a defensible methodology.
3. **Daily interest accrual.** Interest is calculated and added daily based on the deposited amount, not as a lump sum at maturity. On full withdrawal, the user receives the principal plus the interest that was already accrued daily. On partial withdrawal, the interest is recalculated going forward using the new lower balance. This keeps partial withdrawals fair without any complex penalty logic.

A fixed rate keeps the smart contract and backend simple. There is no need for an on-chain oracle, yield aggregator, or dynamic rate engine.
