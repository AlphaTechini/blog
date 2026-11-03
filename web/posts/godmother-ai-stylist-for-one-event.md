---
title: Godmother: An AI Stylist That Starts From the Event
description: An agent with 16 tools and YouCam try-on APIs that finds the dress code, builds three looks on your own photos and prices the shopping list.
category: Projects
date: 2026-11-03
---

## Why

Most virtual try-on tools start from one product on one shop page. They answer "how does this shirt look on me?", but that is rarely the question people actually have. The real question is closer to "what do I wear to this wedding, and what do I need to buy?"

Answering it means finding the dress code, building a whole outfit and matching makeup, hair and jewellery to it, across several shops, before seeing any of it on yourself.

I built Godmother to start from the event instead of the product. It is an AI stylist that shows you three complete looks for one occasion on your own photos, then works toward a shopping list.

## How

It runs as a conversation with an agent, and one rule drives every suggestion: the event outranks taste. A stated dress code beats everything, then the event's colours and theme, then location and culture, and only then personal preference.

### 1. Understanding the event

You give the agent the event's name or a link, and it searches the web for the date, venue, dress code, theme and colours. You can also just describe it, or upload the invitation as a photo or PDF. Then you set where you are, which shapes both the suggestions and the currency used for shopping.

### 2. Photos and wardrobe

You add up to three photos: full body, portrait and hand, because each YouCam feature frames the body differently. You can also upload photos of clothes you already own, and the agent catalogues them so it can use them in a look.

### 3. Three looks

The agent builds three complete outfits and tries each one on you. Pieces come from your wardrobe, from real shop listings (the listing's product photo is what gets tried on), or from a generated design for a made-to-measure piece. Say what you dislike and only that look is re-rendered. You can also say "decide for me", and the agent ranks the three and explains its choice.

### 4. Finishing the chosen look

Once you pick a look, the agent runs face analysis (facial colour tones and face attributes) and uses it to finish the look: shoes, makeup with DIY steps, a hairstyle, earrings, necklace, watch and ring.

### 5. Shopping list and video

Finally it builds a list of everything you would need to buy or have made, priced in your currency, leaving out anything you already own. There is also an optional button that turns the finished look into a 10 second video. That video is AI-generated, so accessories can drift and the camera path is not always the one the prompt asks for.

Behind this sit 16 agent tools and one turn loop: the model calls tools, the tools update the session and stream results back, and the loop ends when the model answers without a tool call. The app is live, and guests can try it without signing up.

## Technologies

- TypeScript
- SvelteKit with Svelte 5
- Anthropic Claude (agent reasoning, web search, vision)
- YouCam APIs (clothes, shoes, makeup, hair, jewellery try-on, skin tone and face analysis, image generation, image to video)
- Node.js on Google Cloud Run, static frontend on Vercel, Cloudflare in front
- Supabase Postgres, Cloudinary and Resend (all optional)
- Argon2id for account passwords
- Vitest

## Architectural decisions

### The server owns every API call

The browser never talks to Anthropic or YouCam. The same SvelteKit code is built twice: as static pages for Vercel and as a Node server for Cloud Run, with Cloudflare in front so the API only answers requests that came through it. This keeps every key on the server and gives one place to enforce spending rules, at the cost of deploying two targets from one codebase. Postgres, image storage and email are optional, so the app still runs from local disk with only the two API keys set.

### Spend units only where the user is looking

YouCam units are the main constraint, so the server enforces how they are spent. All three looks only render the outfit, while shoes, makeup, hair and jewellery render only for the look you choose. Face analysis is the most expensive step (30 units across two calls), so it runs once per session and the result is saved. Units are reserved synchronously before any network call, so parallel renders can't push a session over its cap, and makeup plans are validated before sending, so a bad plan costs nothing.

### Never blindly retry a paid task

Creating a YouCam task is retried only on 429 and 503 responses, where nothing has started. Any other failure might have started a task that will still be charged, so it is never repeated automatically. Instead, each task and its result are journaled as they happen, so an interrupted turn finds its running task or reuses its result. That avoids paying twice, at the cost of more state than a simple retry. Results are also downloaded right away, because YouCam's result links expire after two hours.

### Turns run apart from the request

Each turn runs separately from the HTTP request that started it. If the stream drops, the browser reconnects and gets the current state, then live events until the turn is done. Live turns are held in memory, so this assumes a single server, and a restart marks the turn as interrupted so the user can continue it. Cloud Run also throttles CPU when nobody is connected, so a turn can pause until the browser reconnects; always-on CPU would avoid that but costs money while idle.
