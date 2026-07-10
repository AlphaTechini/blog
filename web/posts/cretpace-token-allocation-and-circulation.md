---
title: Token Allocation and Circulation
category: CrestPace
date: 2026-07-09
description: How CrestPace mints tokens on demand at onboarding, the +5% buffer, pre-minting stablecoins, and the aggregate pool that keeps the internal economy cycling like a real bank.
---

# Token Allocation and Circulation

Even if this isn't a real bank, we still want to mimic the real ones as much as possible. That goal shaped every decision about how tokens enter and circulate within CrestPace.

## Why Web3 at all

We choose Web3 not just because we can actually carry out transfers of tokens with monetary value. If we didn't, then we would basically be storing user's money as just numbers. It won't hold weight. The thought of it would make me quit doing this.

With cryptocurrencies, even though on testnet, we carry out actual blockchain interactions that can be verified. We aren't mocking the money here.

## Minting mirrored tokens

We mint our own tokens. They are going to be mirrors of real popular cryptocurrencies. Our minted token price equals the price of the real token, e.g. BTC.

We might not be able to create a token literally called BTC even on testnet cos it's probably taken, but that's fine. Whatever name we assign will still have part of the original token name in it. Plus the users will still see the names they are familiar with on the frontend. This is to improve User Experience.

The backend will handle all the mapping. In fact, a better method will be to make sure that they are mapped in the frontend, that way no need for backend mapping. However, the backend will still validate token symbol to prevent any potential security vulnerabilities.

## Mint on demand, not a billion tokens

So how do we determine token supply? Do we just mint a billion tokens for each token we will be mirroring and call it a day? NO! Absolutely not! It defies the real bank mimicking idea.

We mint on demand, hence the onboarding flow where we accurately get the average salary of the individual and ask how many percent to deposit.

In the real world you want to use this neobank for regular day-to-day transactions without having to use your standard bank. You receive your pay for the month, ponder on the amount to deposit in the neobank, then you proceed to send that amount there. That's exactly the flow we are trying to recreate here.

For actual token allocation, just like you would choose how much to spend on different things for the month or how much to invest in different stocks and obviously how much to put in different cryptocurrencies, we allow you to set the percentage of your deposited amount you allocate for each token.

## The +5% buffer

After you have allocated, we mint the exact (quantity + 5%) in case the price changes within the short time. Although we fetch the price just before minting, crypto is volatile. The +5% covers the gap between the price at mint time and the price at the next operation.

## Why we also mint stablecoins

This is where it gets interesting. We only actually have access to the locked funds. The other tokens in circulation are in the user's active accounts. So when we want to implement stop losses, how do we get a massive amount of stablecoin equivalent of a user's active balance? Simple, by minting that exact amount at the beginning.

We also mint the stablecoin equivalent, i.e. your preferred stablecoin choosing when they wanted to lock funds. Same stuff even if they didn't choose to lock funds, they will still have to put preferred stablecoin.

This means we have extra supply from those who don't want the stop loss feature.

## The aggregate pool and the cycle

Here's the moment I realised this was a genius architecture. Later on when the market stabilizes a bit, users want to buy tokens again. Well guess what, since we are mimicking real banks, when the stop losses feature swaps from the tokens they own to stablecoins, we end up storing the tokens they held before. We have our own store where:

1. The deposit to activate stop loss is stored
2. The swaps when stop loss activates is stored

This enables a proper cycle.

However, I quickly noticed flaws: It's crypto, what if the user's portfolio improved in value? Well it's crypto, another person's portfolio definitely reduced in value. So they balance each other out. The store is like an aggregate pool. It's not separated per user.

Even with that, what if we apply the same + 5% logic to the stablecoins we mint? The possibility of encountering any trouble is very low.

Now there's also the way banks work. I had to read articles and watch videos about how real banks, neobanks, ledgers work. The main part has to do with lending where they bet not everyone is going to withdraw all their funds at once. Adding this scenario, it's impossible for any problems to occur.

No AI was consulted or assisted to the creation of this system. Proudly made by a human who hasn't yet fried his brain cells.
