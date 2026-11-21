# Runway API examples: Gen-4.5 and Gen-4 image-to-video (useapi.net)

Runnable Node.js examples for the [Runway API](https://useapi.net/docs/api-runwayml-v1?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api) by [useapi.net](https://useapi.net/?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api): generate Runway's own Gen-4.5, Gen-4 and Gen-4 Turbo text-to-video and image-to-video, Aleph video-to-video and Frames images, plus the models Runway hosts: Seedance 2.5, 2.0, 2.0 Fast and 2.0 Mini, Veo 3.1, Kling O3, 3.0 and 2.6, MiniMax H3 and H3 Max, Wan 3.0, 3.0 Prime and 2.6 Flash, FLUX 3, Grok Imagine 1.5, HappyHorse 1.0, Nano Banana Pro, 2, 2 Lite and Nano Banana, GPT Image 2, 1.5 and 1 Mini and Seedream 5, with Act-Two character animation, lip-sync, Kling 3.0 Motion Control and Topaz 4K upscale. It all runs through a REST API on your [Runway subscription](https://runway.com/pricing): Free, Standard $15, Pro $35, Max $95 or Team $69 a seat a month (as of October 2026). It spends your subscription's credits, which Runway's own developer API can't use, and no developer account is needed. Accounts on Runway's Unlimited plan can use credit-free `exploreMode` on images and most video models.

Each example reads a list of prompts from `prompts.json`, submits them through the useapi.net Runway API, polls each task until it is final, and downloads every result — so you can queue a batch and come back to the winners.

| Example | What it does | Tutorial |
|---|---|---|
| [`video/`](./video) | Batch-generate Gen-4.5 and Gen-4 video, text-to-video and first/last-frame image-to-video, with any hosted model selectable per prompt | [How to Generate Runway Gen Videos via API](https://useapi.net/docs/articles/runway-bash?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api) |
| [`frames/`](./frames) | Batch-generate high-fidelity Frames images, including up to three reference images (`@IMG_1`–`@IMG_3`) | [How to Batch-Generate Images with Runway Frames via API](https://useapi.net/docs/articles/runway-frames-script?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api) |

## Quick start

You need [Node.js](https://nodejs.org) v21 or newer (no dependencies to install), a useapi.net [API token](https://useapi.net/docs/start-here/setup-useapi?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api), and a connected [Runway account](https://useapi.net/docs/start-here/setup-runwayml?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api) (one [$15/month subscription](https://useapi.net/docs/subscription?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api) covers every useapi.net API):

```bash
git clone https://github.com/useapi/runway-api.git
cd runway-api/video
node ./runwayml.mjs <API_TOKEN> <EMAIL>
```

`API_TOKEN` is your useapi.net token and `EMAIL` is your connected Runway account email — every script looks the account up by email automatically. Edit `prompts.json` in each folder to queue your own prompts. Every supported parameter is documented on the [POST /videos/create](https://useapi.net/docs/api-runwayml-v1/post-runwayml-videos-create?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api) and [POST /frames/create](https://useapi.net/docs/api-runwayml-v1/post-runwayml-frames-create?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api) endpoint pages.

## MCP server

useapi.net also runs a hosted [Model Context Protocol](https://modelcontextprotocol.io) server for Runway, so an AI assistant such as the Claude app, ChatGPT, Claude Code, Cursor or VS Code Copilot can use it on your Runway accounts. It has 25 tools: video with any of the 25 video models Runway hosts, among them Gen-4.5, Seedance 2.5, Kling O3, Veo 3.1, Wan 3.0 and MiniMax H3; Aleph video edits, Act-Two character animation, voice swap and lip sync; images with 13 models or Frames, and free image-to-prompt descriptions; Topaz 4K upscales; uploads, your task history and running tasks. Every generation tool takes `exploreMode`. Nothing to install or run locally.

- Endpoint: `https://api.useapi.net/v1/runwayml/mcp`
- Transport: Streamable HTTP
- Authorization: your useapi.net API token in the `Authorization: Bearer …` header, and an account connected with the [Runway setup](https://useapi.net/docs/start-here/setup-runwayml?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api). The Claude app and ChatGPT sign in with OAuth instead.

Claude Code:

```bash
claude mcp add --transport http useapi-runwayml https://api.useapi.net/v1/runwayml/mcp --header "Authorization: Bearer YOUR_API_TOKEN"
```

Cursor, VS Code, Windsurf, the Claude app, ChatGPT and the full tool list: [Runway MCP server docs](https://useapi.net/docs/api-runwayml-v1/mcp?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api). useapi.net is a third-party API, not affiliated with Runway.

## Use with Claude Code

This repo is also a Claude Code plugin marketplace. The plugin adds the hosted Runway MCP server, and reads your token from the `USEAPI_TOKEN` environment variable, so set it before you start Claude Code:

```bash
export USEAPI_TOKEN=user:12345-...      # your useapi.net API token
```

Then, inside Claude Code:

```
/plugin marketplace add useapi/runway-api
/plugin install runway@useapi-runway
```

On Claude Code 2.1.275 or later, `/plugin install runway --marketplace useapi/runway-api` does both in one step. Run `/mcp` to check that `useapi-runwayml` is connected.

## Use with Gemini CLI

This repo is also a Gemini CLI extension with the same MCP server:

```bash
gemini extensions install https://github.com/useapi/runway-api
```

The install asks for your useapi.net API token and keeps it in the system keychain. Change it later with `gemini extensions config useapi-runway`, and check the connection with `gemini mcp list`.

## Common questions

<!-- Follows the Runway API overview (useapi.net/docs/api-runwayml-v1), read 2026-10-22. Official: https://docs.dev.runwayml.com/guides/pricing/ and /guides/models/ ($0.01 per credit, re-read 2026-10-22; no Gen-4 video, Gen-4 Aleph, FLUX 3, Frames, lip sync, Kling 2.6, Kling 3.0 Motion Control, Wan 2.6 Flash or Wan 2.2 Animate; Seedance, Veo 3.1 and Act-Two ARE listed, at the same credit counts as the website, so no per-video prices are quoted here). Topaz is left out of the "doesn't sell" list, as on the overview. Sora 2 is gone: OpenAI shut it down on 2026-09-24. Plans: runway.com/pricing via the overview (Max yearly $76 / 9,500 credits = $0.008 a credit). The useapi.net subscription is never added into a comparison. -->
<!-- MCP answer follows useapi.net/docs/api-runwayml-v1/mcp and its comparison (_includes/runway/mcp-vs-official.md in the docs repo). runway.com/mcp read 2026-11-21: sign in with your Runway app account, uses its credits; it does not mention Explore Mode, Act-Two, lip sync, Aleph, upscaling, asset upload or task history; mcp.runwayml.com tools/list answers 401 without sign-in. -->

- **Is there a Runway API?** Yes, through useapi.net. The useapi.net Runway API spends the credits of your Runway subscription, which Runway's own developer API can't use, and reaches models its [developer API](https://docs.dev.runwayml.com/guides/models/) doesn't sell: Gen-4 video, Gen-4 Aleph, Frames, lip sync, FLUX 3, Kling 3.0 Motion Control and 2.6, Wan 2.6 Flash and Wan 2.2 Animate (as of October 2026). Every model runs on one [unified endpoint](https://useapi.net/docs/api-runwayml-v1/post-runwayml-videos-create?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api).
- **Is there a Runway image-to-video API?** Yes, through useapi.net on your Runway subscription's credits. Upload the still with [POST /assets](https://useapi.net/docs/api-runwayml-v1/post-runwayml-assets?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api) and pass its `assetId` as `imageAssetId1` (the start frame) to [POST /videos/create](https://useapi.net/docs/api-runwayml-v1/post-runwayml-videos-create?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api). For a first-to-last-frame transition, add `imageAssetId2` on `kling-3.0-pro`, `kling-3.0-standard` or `veo-3.1`, while the Gen-4.x models take a start frame only. The [`video/`](./video) example does both.
- **Which models can I use?** Through useapi.net, pick one per request with `model`: `gen4.5` (default), `gen4`, `gen4-turbo`, plus `seedance-2-5`, `seedance-2` / `-fast` / `-mini`, `veo-3.1`, `kling-o3-4k` / `-pro` / `-standard`, `kling-3.0-pro` / `-standard`, `kling-3.0-motion-control`, `kling-2.6-pro` / `-i2v`, `minimax-h3` / `minimax-h3-max`, `wan-3.0` / `wan-3.0-prime`, `wan-2.6-flash`, `wan-2.2-animate`, `flux-3`, `grok-imagine-1.5` and `happyhorse-1.0`.
- **Where do I get an API key?** With useapi.net you need no Runway developer key: you call this API with a useapi.net [API token](https://useapi.net/docs/start-here/setup-useapi?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api) and connect your Runway account once with its email and password through the [Runway setup](https://useapi.net/docs/start-here/setup-runwayml?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api). Create the Runway account with the email option (Google, Apple and SSO sign-ups aren't supported). A free Runway account gets unlimited Image Upscaler and Frames Describe runs through this API.
- **How much does it cost?** Through useapi.net, Runway videos and images spend the monthly credits of the [Runway subscription](https://runway.com/pricing) you already pay for, the same credits each one uses in the Runway app. Runway's developer API can't spend those credits and sells its own at $0.01 each, while Max billed yearly works out to $0.008 a credit ($76 a month for 9,500 credits, as of October 2026). The [cost calculator](https://useapi.net/docs/api-runwayml-v1?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api#pricing) prices every model on every plan.
- **Can I make images, animate characters and lip-sync too?** Yes, through useapi.net on the same Runway subscription: [Frames](https://useapi.net/docs/api-runwayml-v1/post-runwayml-frames-create?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api) and the [unified images endpoint](https://useapi.net/docs/api-runwayml-v1/post-runwayml-images-create?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api) (FLUX 3 Image, Nano Banana Pro, GPT Image 2, Seedream 5 and more), [Act-Two](https://useapi.net/docs/api-runwayml-v1/post-runwayml-gen4-act-two?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api), [lip-sync](https://useapi.net/docs/api-runwayml-v1/post-runwayml-lipsync-create?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api) in at least 28 languages and [4K upscale](https://useapi.net/docs/api-runwayml-v1/post-runwayml-videos-upscale?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api).
- **Is there a Runway MCP server?** Yes, through useapi.net: a hosted [Runway MCP server](https://useapi.net/docs/api-runwayml-v1/mcp?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api) with 25 tools that spreads tasks across several of your Runway accounts in one connection, with Explore Mode on every generation tool, nothing to install, and that also connects in the Claude app and ChatGPT. Runway's own hosted [Runway MCP](https://runway.com/mcp) signs in to one Runway account and doesn't publish its tool list; Explore Mode, Act-Two, lip sync, Aleph edits, 4K upscales, uploads and task history are not mentioned on runway.com/mcp (checked November 21, 2026). The same useapi.net token also runs your own scripts and webhooks on your subscription credits, which Runway's developer API can't spend, so that is only available through useapi.net ([full comparison](https://useapi.net/docs/api-runwayml-v1/mcp?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api#useapinet-vs-runways-own-mcp-servers)).
- **How many accounts can I connect?** Through useapi.net, one [$15/month subscription](https://useapi.net/docs/subscription?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api) covers every API and 3 Runway accounts, and each extra $10/month subscription adds 3 more. A request without `email` goes to an available connected account, so a batch spreads across all of them, and each account runs up to its `maxJobs` limit (1 to 10) at the same time.
- More answers: [Runway API questions](https://useapi.net/docs/api-runwayml-v1?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api#questions) and the [Runway tutorial FAQ](https://useapi.net/docs/articles/runway-bash?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api#frequently-asked-questions).

## Tutorials

- [How to Generate Runway Gen Videos via API](https://useapi.net/docs/articles/runway-bash?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api): text-to-video and first/last-frame image-to-video via the unified `videos/create` endpoint, the model lineup, and `exploreMode`
- [How to Batch-Generate Images with Runway Frames via API](https://useapi.net/docs/articles/runway-frames-script?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api): high-fidelity Frames images, styles, and up to three reference images
- [Seedance 2.0 and 2.5 API Pricing: Every Route, Compared](https://useapi.net/docs/articles/seedance-2-api-pricing?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api): Seedance on Runway, including real faces

## About useapi.net

[useapi.net](https://useapi.net/?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api) is a third-party REST API for AI services. The Runway API runs on your [Runway subscription](https://runway.com/pricing), so you spend its credits at website rates instead of metered developer-API pricing. See the models and pricing on the [Runway API overview](https://useapi.net/docs/api-runwayml-v1?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api).

Visit our [Discord Server](https://discord.gg/w28uK3cnmF) or [Telegram Channel](https://t.me/use_api) for any support questions and concerns.

We regularly post guides and tutorials on the [YouTube Channel](https://www.youtube.com/@useapi-net).

## License

The example code in this repository is released under the [MIT License](./LICENSE). It covers the example scripts only, not the useapi.net service or API.
