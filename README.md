# Runway API examples (useapi.net)

Runnable Node.js examples for the [Runway API](https://useapi.net/docs/api-runwayml-v1) by [useapi.net](https://useapi.net) — drive your own [Runway](https://runwayml.com) account over a simple REST API. Beyond Runway's native **Gen-4.5 / Gen-4 / Gen-4 Turbo / Gen-4 Aleph** video and **Frames** images, the same account reaches the **frontier third-party models Runway hosts** — **Veo 3.1**, **Sora 2 / Sora Pro**, **Kling v3**, **Seedance 2.0**, **Wan 2.6 / 2.2 Animate**, **FLUX.2**, **Nano Banana / Pro**, and **GPT Image** — plus **Act-Two** character animation, **lip-sync**, **video extend**, **Kling motion control**, and **Topaz 4K upscale**. No developer account, no per-call metering; the **Runway Unlimited** plan unlocks credit-free `exploreMode` on images and most video models.

Each example reads a list of prompts from `prompts.json`, submits them through the useapi.net Runway API, polls each task until it is final, and downloads every result — so you can queue a batch and come back to the winners.

| Example | What it does | Tutorial |
|---|---|---|
| [`video/`](./video) | Batch-generate **Gen-4.5 / Gen-4** video — text-to-video and first/last-frame image-to-video — with any hosted model selectable per prompt | [How to Generate Runway Gen Videos via API](https://useapi.net/docs/articles/runway-bash) |
| [`frames/`](./frames) | Batch-generate high-fidelity **Frames** images, including up to three **reference images** (`@IMG_1`–`@IMG_3`) | [How to Batch-Generate Images with Runway Frames via API](https://useapi.net/docs/articles/runway-frames-script) |

## Quick start

You need [Node.js](https://nodejs.org) v21 or newer (no dependencies to install), a useapi.net [API token](https://useapi.net/docs/start-here/setup-useapi), and a connected [Runway account](https://useapi.net/docs/start-here/setup-runwayml) (one [$15/month subscription](https://useapi.net/docs/subscription) covers every useapi.net API):

```bash
git clone https://github.com/useapi/runway-api.git
cd runway-api/video
node ./runwayml.mjs <API_TOKEN> <EMAIL>
```

`API_TOKEN` is your useapi.net token and `EMAIL` is your connected Runway account email — every script looks the account up by email automatically. Edit `prompts.json` in each folder to queue your own prompts. Every supported parameter is documented on the [POST /videos/create](https://useapi.net/docs/api-runwayml-v1/post-runwayml-videos-create) and [POST /frames/create](https://useapi.net/docs/api-runwayml-v1/post-runwayml-frames-create) endpoint pages.

## Tutorials

- [How to Generate Runway Gen Videos via API](https://useapi.net/docs/articles/runway-bash) — text-to-video and first/last-frame image-to-video via the unified `videos/create` endpoint, the model lineup, and `exploreMode`
- [How to Batch-Generate Images with Runway Frames via API](https://useapi.net/docs/articles/runway-frames-script) — high-fidelity Frames images, styles, and up to three reference images

## About useapi.net

[useapi.net](https://useapi.net) is an experimental REST API for AI services. The Runway API drives your own [Runway](https://runwayml.com) account, so you spend your plan's credits at consumer rates instead of metered developer-API pricing. See the [model matrix](https://useapi.net/model-matrix) and pricing on the [API overview](https://useapi.net/docs/api-runwayml-v1).

Visit our [Discord Server](https://discord.gg/w28uK3cnmF) or [Telegram Channel](https://t.me/use_api) for any support questions and concerns.

We regularly post guides and tutorials on the [YouTube Channel](https://www.youtube.com/@midjourneyapi).
