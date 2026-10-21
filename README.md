# Runway API examples: Gen-4.5 and Gen-4 image-to-video (useapi.net)

Runnable Node.js examples for the [Runway API](https://useapi.net/docs/api-runwayml-v1?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api) by [useapi.net](https://useapi.net/?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api): generate Runway's own **Gen-4.5 / Gen-4 / Gen-4 Turbo** text-to-video and image-to-video, **Aleph** video-to-video and **Frames** images, plus the **models Runway hosts**, **Seedance 2.5 / 2.0**, **Veo 3.1**, **Kling O3 / 3.0**, **MiniMax H3**, **Wan 3.0**, **FLUX 3**, **Sora 2**, **Grok Imagine 1.5**, **HappyHorse**, **Nano Banana / Pro**, **GPT Image** and **Seedream 5**, with **Act-Two** character animation, **lip-sync**, **Kling motion control** and **Topaz 4K upscale**. It all runs through a simple REST API that drives your own [Runway](https://runwayml.com) account, with no developer account or per-call metering; accounts on Runway's **Unlimited** plan can use credit-free `exploreMode` on images and most video models.

Each example reads a list of prompts from `prompts.json`, submits them through the useapi.net Runway API, polls each task until it is final, and downloads every result — so you can queue a batch and come back to the winners.

| Example | What it does | Tutorial |
|---|---|---|
| [`video/`](./video) | Batch-generate **Gen-4.5 / Gen-4** video — text-to-video and first/last-frame image-to-video — with any hosted model selectable per prompt | [How to Generate Runway Gen Videos via API](https://useapi.net/docs/articles/runway-bash) |
| [`frames/`](./frames) | Batch-generate high-fidelity **Frames** images, including up to three **reference images** (`@IMG_1`–`@IMG_3`) | [How to Batch-Generate Images with Runway Frames via API](https://useapi.net/docs/articles/runway-frames-script) |

## Quick start

You need [Node.js](https://nodejs.org) v21 or newer (no dependencies to install), a useapi.net [API token](https://useapi.net/docs/start-here/setup-useapi?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api), and a connected [Runway account](https://useapi.net/docs/start-here/setup-runwayml) (one [$15/month subscription](https://useapi.net/docs/subscription?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api) covers every useapi.net API):

```bash
git clone https://github.com/useapi/runway-api.git
cd runway-api/video
node ./runwayml.mjs <API_TOKEN> <EMAIL>
```

`API_TOKEN` is your useapi.net token and `EMAIL` is your connected Runway account email — every script looks the account up by email automatically. Edit `prompts.json` in each folder to queue your own prompts. Every supported parameter is documented on the [POST /videos/create](https://useapi.net/docs/api-runwayml-v1/post-runwayml-videos-create) and [POST /frames/create](https://useapi.net/docs/api-runwayml-v1/post-runwayml-frames-create) endpoint pages.

## Common questions

<!-- Official API figures in these answers, verified 2026-10-20: https://docs.dev.runwayml.com/guides/pricing/ ($0.01 per credit; no Sora 2 / Sora 2 Pro, FLUX 3, Kling 2.6, Kling 3.0 Motion Control, Wan 2.2 Animate or Topaz upscale on the developer price list; Seedance 2.5 IS listed at 480p-1080p). Plan figures: useapi.net/docs/api-runwayml-v1 calculator (Max yearly $76 / 9,500 credits = $0.008/credit). Price quoted per credit, on the plan's cost only (the useapi.net subscription is never added into a comparison). -->

- **Is there a Runway API?** Yes, and this repo uses the useapi.net Runway API, which spends the credits of the Runway [website plan](https://runwayml.com/pricing) you already pay for, credits Runway's own developer API can't use. Those credits reach models its [developer price list](https://docs.dev.runwayml.com/guides/pricing/) doesn't sell: FLUX 3, Kling 2.6, Kling 3.0 Motion Control, Wan 2.2 Animate and Topaz 4K upscale (as of October 2026). Every model runs on one [unified endpoint](https://useapi.net/docs/api-runwayml-v1/post-runwayml-videos-create?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api).
- **Is there a Runway image-to-video API?** Yes. Upload the still with [POST /assets](https://useapi.net/docs/api-runwayml-v1/post-runwayml-assets?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api) and pass its `assetId` as `imageAssetId1` (the start frame) to [POST /videos/create](https://useapi.net/docs/api-runwayml-v1/post-runwayml-videos-create?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api). For a first-to-last-frame transition, add `imageAssetId2` on `kling-3.0-pro` or `veo-3.1`; the Gen-4.x models take a start frame only. The [`video/`](./video) example does both.
- **Which models can I use?** Pick one per request with `model`: `gen4.5` (default), `gen4`, `gen4-turbo`, plus `seedance-2-5`, `seedance-2` / `-fast` / `-mini`, `veo-3.1`, the `kling-o3-*` tiers, `kling-3.0-pro` / `-standard`, `kling-2.6-pro`, `minimax-h3` / `minimax-h3-max`, `wan-3.0` / `wan-3.0-prime`, `flux-3`, `sora-2` / `sora-2-pro`, `grok-imagine-1.5` and `happyhorse-1.0`.
- **Where do I get an API key?** You call this API with a useapi.net [API token](https://useapi.net/docs/start-here/setup-useapi?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api) and connect your Runway account once with its email and password through the [Runway setup](https://useapi.net/docs/start-here/setup-runwayml?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api). Create the Runway account with the email option (Google, Apple and SSO sign-ups aren't supported). You can start on a free Runway account, which gets unlimited Image Upscaler and Frames Describe runs through this API.
- **How much does it cost?** Through useapi.net a Runway credit costs $0.008 on Max billed yearly ($76/month for 9,500 credits), against $0.01 on Runway's developer API (as of October 2026). Generations cost the same credits as in the web app. The [cost calculator](https://useapi.net/docs/api-runwayml-v1?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api) prices every model on every plan.
- **Can I make images, animate characters and lip-sync too?** Yes: [Frames](https://useapi.net/docs/api-runwayml-v1/post-runwayml-frames-create?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api) and the [unified images endpoint](https://useapi.net/docs/api-runwayml-v1/post-runwayml-images-create?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api) (13 models), [Act-Two](https://useapi.net/docs/api-runwayml-v1/post-runwayml-gen4-act-two?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api), [lip-sync](https://useapi.net/docs/api-runwayml-v1/post-runwayml-lipsync-create?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api) in 28+ languages and [4K upscale](https://useapi.net/docs/api-runwayml-v1/post-runwayml-videos-upscale?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api).
- **How many accounts can I connect?** Each useapi.net subscription covers 3 Runway accounts, and each extra $10/month subscription adds 3 more.
- More answers: [Runway API questions](https://useapi.net/docs/articles/runway-bash?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api#frequently-asked-questions).

## Tutorials

- [How to Generate Runway Gen Videos via API](https://useapi.net/docs/articles/runway-bash) — text-to-video and first/last-frame image-to-video via the unified `videos/create` endpoint, the model lineup, and `exploreMode`
- [How to Batch-Generate Images with Runway Frames via API](https://useapi.net/docs/articles/runway-frames-script) — high-fidelity Frames images, styles, and up to three reference images

## About useapi.net

[useapi.net](https://useapi.net/?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api) is an experimental REST API for AI services. The Runway API drives your own [Runway](https://runwayml.com) account, so you spend your plan's credits at consumer rates instead of metered developer-API pricing. See the [model matrix](https://useapi.net/model-matrix?utm_source=github.com&utm_medium=referral&utm_campaign=runway-api) and pricing on the [API overview](https://useapi.net/docs/api-runwayml-v1).

Visit our [Discord Server](https://discord.gg/w28uK3cnmF) or [Telegram Channel](https://t.me/use_api) for any support questions and concerns.

We regularly post guides and tutorials on the [YouTube Channel](https://www.youtube.com/@useapi-net).

## License

The example code in this repository is released under the [MIT License](./LICENSE). It covers the example scripts only, not the useapi.net service or API.
