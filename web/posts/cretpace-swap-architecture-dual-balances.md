---
title: Swap Architecture and Dual Balances
category: CrestPace
date: 2026-07-09
description: How CrestPace fulfills swap requests from an internal pool, falls back to lending from savings accounts, and uses a virtual vs actual balance split to keep the user's view clean.
---

# Swap Architecture and Dual Balances

The swap feature is the part where I have not been able to find a better solution than what individual banks give. But the architecture I designed around it is what makes CrestPace behave like a real bank instead of a token exchange.

## The internal pool

Remember the +5% from token allocation? The excess is also stored in our pool. And I meant +5% for each token.

When a user requests a swap, we first check if we can fulfill with only our pool without the reserves for that token going below 5%.

If it does, then we have to act like banks. Use someone's or a group of people's savings account.

I haven't yet come up with an architecture for using a group of people. For the single person, it will be the one with the least number of transactions.

## The problem this creates

Now does this mean the user will wake up to see a debit alert or the balance decrease? Nope.

Meaning I'll have to properly label this particular operation such that the backend doesn't trigger any updates to the user's viewed balance. This is what made me implement a dual balance architecture.

## Virtual vs actual balance

Here the user has two balances:

**The virtual balance** - what he/she sees.

**The actual balance** - this one has all the user's token movement. In fact, this will be directly tied to the ledger.

There is one caveat though: we have to make the virtual balance + non-lending operations from the ledger source of truth.

Honestly, the virtual = actual - lending operations.

This is better and more direct, meaning we approve any transaction the user requests using virtual as source of truth. The actual is only going to be referenced to see if we need to borrow or use our pool to restock the user's balance behind the scenes. Making actual = virtual once again.

## Why this works

The user never sees the lending operations. They request a swap, the virtual balance is the source of truth for approval, and the actual balance handles the behind-the-scenes mechanics. When we borrow from savings or use the pool to restock, the actual balance gets reconciled back to match the virtual.

I have tried my best to design the architecture in a way that doesn't mint tokens again after the onboarding, causing it to be more like a real bank works.
