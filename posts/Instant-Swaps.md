This blog is about how instant swaps work and what I learned about them. The ability to convert in different centralized exchanges is a core feature I want to implement in my application, and I wanted to find out how existing major exchanges implement it.

For instant swaps, when you try to initiate a swap, the system locks a particular price for a certain number of seconds, depending on the centralized exchange you're using. How does it get that price? These centralized exchanges use what they call order books. Order books are basically a record of different buy and sell orders that are currently open in the market.
Also, the order books are based on the tokens you actually want to swap.

There are different markets for:
1. USDT to USDC transactions
2. Ethereum to BTC orders   and so on...

The order book used will be the one specific to the two tokens you want to swap, matching those two exactly.

Here’s how it works for smaller transactions:
1.  The system finds the best prices. Let's say you need to swap $100,000 worth of a token.
2.  The "best price" refers to the lowest available rate. For example, the first order might be for 30 tokens at $1 each.
3.  If you want to swap 70 tokens, 30 of them will be fulfilled by this first order at $1 per token.
4.  The remaining 40 tokens will be fulfilled by the next available order, which might be at a slightly higher price, say $1.3 per token.

To calculate the average price:
-   Multiply 30 tokens by $1 to get $30.
-   Multiply 40 tokens by $1.3 to get $52.
-   Add these amounts ($30 + $52 = $82).
-   Divide the total by the initial number of tokens (70), so $82 / 70.
-   This will result in a quote of about $1.17.

This division gives you the quote price, which is then locked in for a few seconds. The quote will only be canceled if the market's slippage exceeds a certain amount (e.g., 10%). This locking mechanism is important because prices change rapidly, making it easier to provide a defined quote for instant swaps.

For larger transactions (e.g., above $100,000), a different mechanism is used, often referred to as "OTC" (Over-The-Counter) or "affordance." Centralized exchanges will ping the APIs of their private liquidity pools. These liquidity pools submit bids based on their own risk assessment and how low they are willing to price the asset.

The matching engine then chooses the bid with the best price. For instance, if two pools offer $1.1 per token and another offers $1.05, the engine will select the $1.05 bid. Different liquidity providers use different algorithms and do not see each other's bids. They submit their bids based on their assessment of the market and the risk they are willing to take. If they perceive a token as volatile, they might quote a higher price or abstain from bidding.

This entire process happens very quickly, enabling quick and instant transfers with zero extra fees for the swaps. Learning this has really got me thinking about the web app I want to build. Since I focus on engineering brilliance and difficult engineering problems, I'm wondering if I can simulate this order book algorithm and liquidity pools. Perhaps I can find APIs to fetch data and build my own internal order book, adding a new level of complexity that excites me for the project.